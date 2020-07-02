import React, { useContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { usePubNub } from "pubnub-react";
import { CrossIcon } from "foundations/components/icons/CrossIcon";
import {
  Wrapper,
  VideoWrapper,
  Header,
  Body,
  Title,
  CloseButton,
  MyVideo,
  RemoteVideo,
  LocalVideoWrapper,
  RemoteVideoWrapper,
  CallStatus
} from "./RtcDisplay.style";
import { ThemeContext } from "styled-components";
import { getViewStates } from "../../layout/Selectors";
import { rtcViewHidden, rtcViewDisplayed } from "../../layout/LayoutActions";
import {
  callCompleted,
  callNotAnswered,
  incomingCallReceived,
  incomingCallAccepted,
  outgoingCallAccepted,
  getCurrentCall,
  callCanceled,
  callDeclined,
  callConnected
} from "../RtcModel";
import { RtcCallState } from "../RtcCallState.enum";
import { RtcCallType } from "../RtcCallType.enum";
import { getMessagesById } from "../../messages/messageModel";
import { getUsersById } from "../../users/userModel";
import { createSelector } from "reselect";
import { getLoggedInUserId } from "../../authentication/authenticationModel";
import {
  connectMedia,
  createIceOffer,
  negotiateIceOffer,
  createIceAnswer,
  createPeerConnection,
  disconnectMedia,
  setRemoteDescription,
  addIceCandidate,
  setIceCandidateHandler,
  setNegotiationNeededHandler,
  setConnectionStateHandler,
  setIceConnectionStateHandler,
  setTrackHandler,
  sendMedia
} from "../RtcConnection";
import { signaling } from "../RtcSignaling";
// import RtcSettings from "config/rtcSettings.json";

declare var cordova:any;

// const VIDEO_CONSTRAINTS = RtcSettings.rtcVideoConstraints;

export const getLastCallMessage = createSelector(
  [getMessagesById, getLoggedInUserId, getUsersById],
  (messages, userId, users): any => {
    let userMessages = messages[userId]
      ? Object.values(messages[userId])
          .filter(message => message.channel === userId)
          .map((message): any => {
            return {
              ...message.message,
              timetoken: String(message.timetoken),
              sender:
                users[message.message.senderId] ||
                (message.message.senderId
                  ? {
                      id: message.message.senderId,
                      name: message.message.senderId
                    }
                  : {
                      id: "unknown",
                      name: "unknown"
                    })
            };
          })
      : [];

    return userMessages.length > 0
      ? userMessages[userMessages.length - 1]
      : undefined;
  }
);

const RtcDisplay = () => {
  const pubnub = usePubNub();
  const dispatch = useDispatch();
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [dialed, setDialed] = useState(false);
  const [peerAnswered, setPeerAnswered] = useState(false);
  const [incoming, setIncoming] = useState(false);
  const [answered, setAnswered] = useState(false);
  const currentCall = useSelector(getCurrentCall);
  const lastCallMessage = useSelector(getLastCallMessage);
  const views = useSelector(getViewStates);
  const myId = useSelector(getLoggedInUserId);
  const theme = useContext(ThemeContext);

  const releaseMedia = async () => {
    await disableLocalMedia();
    await disableRemoteMedia();
    await disconnectMedia();
  };

  const callPeer = async () => {
    console.log("call peer: calling", currentCall.peerUserId);
    setDialed(true);

    await releaseMedia();

    // prompt current user for camera access
    const mediaStream = await connectMedia({ audio, video });

    if (video) {
      if (document.querySelector("#myvideo")) {
        (document.querySelector("#myvideo") as any).srcObject = mediaStream;
      }
    }

    // send calling signal to peer
    await signaling.callInit(
      myId,
      currentCall.peerUserId,
      currentCall.startTime
    );
  };

  const answerCall = async () => {
    console.log("answer call");
    setAnswered(true);

    await releaseMedia();

    // prompt user for camera access
    const mediaStream = await connectMedia({ audio, video });

    if (video) {
      if (document.querySelector("#myvideo")) {
        (document.querySelector("#myvideo") as any).srcObject = mediaStream;
      }
    }

    // update local store with accepted call information
    dispatch(
      incomingCallAccepted(lastCallMessage.sender.id, lastCallMessage.startTime)
    );

    await createPeerConnection();

    console.log("answer: sending answer to peer", lastCallMessage.sender.id);

    signaling.callAccept(
      myId,
      lastCallMessage.sender.id,
      lastCallMessage.startTime
    );
  };

  const updateCallStatus = async (cancel?: boolean) => {
    console.log("update call status from: ", currentCall.callState);

    // update local store with completed call information
    if (
      currentCall.callState === RtcCallState.CONNECTED ||
      currentCall.callState === RtcCallState.ACCEPTED
    ) {
      dispatch(
        callCompleted(
          currentCall.peerUserId,
          currentCall.startTime,
          new Date().getTime()
        )
      );
    } else if (
      currentCall.callState === RtcCallState.INITIATED ||
      currentCall.callState === RtcCallState.RECEIVING
    ) {
      if (cancel) {
        if (currentCall.callState === RtcCallState.INITIATED) {
          dispatch(
            callCanceled(
              currentCall.peerUserId,
              currentCall.startTime,
              new Date().getTime()
            )
          );
        } else {
          dispatch(
            callDeclined(
              currentCall.peerUserId,
              currentCall.startTime,
              new Date().getTime()
            )
          );
        }
      } else {
        dispatch(
          callNotAnswered(
            currentCall.peerUserId,
            currentCall.startTime,
            new Date().getTime()
          )
        );
      }
    }
  };

  const endCall = async () => {
    console.log("end call");

    updateCallStatus(true);

    console.log("end call: sending", currentCall.peerUserId);

    await signaling.callEnd(
      myId,
      currentCall.peerUserId,
      currentCall.startTime
    );

    closeMedia();
  };

  const onCallIncoming = async (callerId: string, startTime: number) => {
    console.log("incoming call: receiving call from peer");
    setIncoming(true);

    // update local store with receiving call information
    dispatch(incomingCallReceived(callerId, startTime));

    // ensure the rtc view is displayed
    dispatch(rtcViewDisplayed());
  };

  const onCallAccepted = async (callerId: string, startTime: number) => {
    console.log("accepted: outgoing call accepted by peer");
    setPeerAnswered(true);

    // update local store with call accepted status
    dispatch(outgoingCallAccepted(callerId, startTime));

    await createPeerConnection();

    await sendMedia();

    const offer = await createIceOffer();

    if (offer) {
      await signaling.iceOffer(
        myId,
        currentCall.peerUserId,
        currentCall.startTime,
        offer
      );
    } else {
      console.log("accepted: unable to create ice offer");
    }
  };

  const onCallEnded = async (callerId: string, startTime: number) => {
    console.log("ended: outgoing call ended by peer");

    // update local store with completed call information
    if (
      currentCall.peerUserId === callerId &&
      currentCall.startTime === startTime
    ) {
      if (
        currentCall.callType === RtcCallType.OUTGOING &&
        currentCall.callState === RtcCallState.INITIATED
      ) {
        dispatch(
          callDeclined(
            currentCall.peerUserId,
            currentCall.startTime,
            new Date().getTime()
          )
        );
      } else if (
        currentCall.callType === RtcCallType.INCOMING &&
        currentCall.callState === RtcCallState.RECEIVING
      ) {
        dispatch(
          callCanceled(
            currentCall.peerUserId,
            currentCall.startTime,
            new Date().getTime()
          )
        );
      } else if (
        currentCall.callState === RtcCallState.ACCEPTED ||
        currentCall.callState === RtcCallState.CONNECTED
      ) {
        dispatch(
          callCompleted(
            currentCall.peerUserId,
            currentCall.startTime,
            new Date().getTime()
          )
        );
      }

      closeMedia();
    }
  };

  const onIceCandidate = async (
    callerId: string,
    startTime: number,
    candidate: RTCIceCandidate | null
  ) => {
    if (
      currentCall.peerUserId === callerId &&
      currentCall.startTime === startTime
    ) {
      if (candidate !== null) {
        addIceCandidate(candidate);
      }
    }
  };

  const onIceOffer = async (
    callerId: string,
    startTime: number,
    offer: RTCSessionDescription
  ) => {
    if (
      currentCall.peerUserId === callerId &&
      currentCall.startTime === startTime
    ) {
      setRemoteDescription(offer);

      await sendMedia();

      const answer = await createIceAnswer();

      if (answer) {
        if (answer) {
          await signaling.iceAnswer(
            myId,
            currentCall.peerUserId,
            currentCall.startTime,
            answer
          );
        } else {
          console.log("onIceOffer: unable to signal ice answer");
        }
      } else {
        console.log("onIceOffer: unable to create ice answer");
      }
    }
  };

  const onIceAnswer = async (
    callerId: string,
    startTime: number,
    answer: RTCSessionDescription
  ) => {
    if (
      currentCall.peerUserId === callerId &&
      currentCall.startTime === startTime
    ) {
      setRemoteDescription(answer);
    }
  };

  const onCallTimeout = async () => {
    if (currentCall.callType === RtcCallType.OUTGOING) {
      console.log("outgoing call timed out");
      console.log("dialed", dialed);
      console.log("peer ansswered", peerAnswered);
      if (dialed && !peerAnswered) {
        updateCallStatus();
      }
    } else {
      setIncoming(false);
      console.log("incoming call timed out");
      console.log("incoming", incoming);
      console.log("answered", dialed);
      if (incoming && !answered) {
        updateCallStatus();
      }
    }
  };

  /**
   * Initialize signaling
   */
  useEffect(() => {
    signaling.init(pubnub, dispatch);
  }, [pubnub, dispatch]);

  const disableAudio = async () => {
    return;
  };

  const disableVideo = async () => {
    if (document.querySelector("#myvideo")) {
      (document.querySelector("#myvideo") as any).srcObject &&
        (document.querySelector("#myvideo") as any).srcObject
          .getTracks()
          .forEach((track: MediaStreamTrack) => {
            track.stop();
          });

      (document.querySelector("#myvideo") as any).srcObject = undefined;
    }
  };

  const disableLocalMedia = async () => {
    await disableVideo();
    await disableAudio();
  };

  const disableRemoteVideo = async () => {
    if (document.querySelector("#remotevideo")) {
      (document.querySelector("#remotevideo") as any).srcObject &&
        (document.querySelector("#remotevideo") as any).srcObject
          .getTracks()
          .forEach((track: MediaStreamTrack) => {
            track.stop();
          });

      (document.querySelector("#remotevideo") as any).srcObject = undefined;
    }
  };

  const disableRemoteAudio = async () => {
    if (document.querySelector("#remoteaudio")) {
      (document.querySelector("#remoteaudio") as any).srcObject &&
        (document.querySelector("#remoteaudio") as any).srcObject
          .getTracks()
          .forEach((track: MediaStreamTrack) => {
            track.stop();
          });

      (document.querySelector("#remoteaudio") as any).srcObject = undefined;
    }
  };

  const disableRemoteMedia = async () => {
    await disableRemoteVideo();
    await disableRemoteAudio();
  };

  const enableVideo = async (mediaConstraints: MediaStreamConstraints) => {
    let stream = await connectMedia(mediaConstraints);

    if (document.querySelector("#myvideo")) {
      (document.querySelector("#myvideo") as any).srcObject = stream;
    }
  };

  const enableAudio = async (mediaConstraints: MediaStreamConstraints) => {
    await connectMedia(mediaConstraints);
    return;
  };

  const updateMedia = async (mediaConstraints: MediaStreamConstraints) => {
    await releaseMedia();

    if (mediaConstraints.video) {
      await enableVideo(mediaConstraints);
    } else if (mediaConstraints.audio) {
      await enableAudio(mediaConstraints);
    } else {
      await disableLocalMedia();
    }
  };

  const toggleVideo = () => {
    updateMedia({ audio, video: !video });
    setVideo(!video);
  };

  const toggleAudio = () => {
    updateMedia({ audio: !audio, video });
    setAudio(!audio);
  };

  const closeMedia = async () => {
    await releaseMedia();
    setDialed(false);
    setAnswered(false);
    setIncoming(false);
    setVideo(true);
    setAudio(true);
    stopRing();
  };

  const isDialing = () => {
    return currentCall.callState === RtcCallState.INITIATED;
  };

  const isIncomingCall = () => {
    return !isDialing() && currentCall.callState === RtcCallState.RECEIVING;
  };

  const closeCall = () => {
    if (currentCall.callState === RtcCallState.INITIATED) {
      dispatch(
        callCompleted(
          currentCall.peerUserId,
          currentCall.startTime,
          new Date().getTime()
        )
      );
    }
    endCall();
    dispatch(rtcViewHidden());
  };

  const getStateDisplayString = () => {
    if (currentCall.callState === RtcCallState.INITIATED) {
      return "Calling";
    } else if (currentCall.callState === RtcCallState.ACCEPTED) {
      return "Call Accepted";
    } else if (currentCall.callState === RtcCallState.RECEIVING) {
      return "Receiving Call";
    } else if (currentCall.callState === RtcCallState.CONNECTED) {
      return "Call Connected";
    } else if (currentCall.callState === RtcCallState.COMPLETED) {
      return "Call Completed";
    } else if (currentCall.callState === RtcCallState.CANCELED) {
      return "Call Canceled";
    } else if (currentCall.callState === RtcCallState.DECLINED) {
      return "Call Declined";
    } else if (
      currentCall.callState === RtcCallState.NOT_ANSWERED &&
      currentCall.callType === RtcCallType.INCOMING
    ) {
      return "Call Missed";
    } else if (
      currentCall.callState === RtcCallState.NOT_ANSWERED &&
      currentCall.callType === RtcCallType.OUTGOING
    ) {
      return "Call Not Answered";
    } else {
      return "Disconnected";
    }
  };

  const startRing = () => {
    if (document.querySelector("#ring")) {
      (document.querySelector("#ring") as any).play();
    }
  };

  const stopRing = () => {
    if (document.querySelector("#ring")) {
      (document.querySelector("#ring") as any).pause();
    }
  };

  if (incoming && currentCall.callState === RtcCallState.RECEIVING) {
    startRing();
  } else {
    stopRing();
  }

  signaling.setHandlers(
    onCallIncoming,
    onCallAccepted,
    onCallEnded,
    onCallTimeout,
    onIceCandidate,
    onIceOffer,
    onIceAnswer
  );

  setIceCandidateHandler(async (candidate: RTCIceCandidate | null) => {
    console.log("ice candidate handler peer: ", currentCall.peerUserId);
    if (candidate !== null) {
      signaling.iceCandidate(
        myId,
        currentCall.peerUserId,
        currentCall.startTime,
        candidate
      );
    }
  });

  setNegotiationNeededHandler(async (event: Event) => {
    console.log("negotiation needed: creating new offer");
    const offer = await negotiateIceOffer();

    if (offer) {
      await signaling.iceOffer(
        myId,
        currentCall.peerUserId,
        currentCall.startTime,
        offer
      );
    } else {
      console.log("negotiation needed: unable to create ice offer");
    }
  });

  setTrackHandler(async (e: RTCTrackEvent) => {
    console.log("setTrackHandler");
    // const remoteVideo = document.querySelector("#remotevideo") as any;
    // e.track.onunmute = () => {
    //   if (remoteVideo.srcObject) {
    //     return;
    //   }
    const stream = new MediaStream();
      (document.querySelector("#remotevideo") as any).srcObject = stream;
      stream.addTrack(e.track);
      // (document.querySelector("#remotevideo") as any).srcObject
      //   .getVideoTracks()
      //   .forEach((track: MediaStreamTrack) => {
      //     track.applyConstraints(VIDEO_CONSTRAINTS);
      //   });
    // };
  });

  setConnectionStateHandler(async (state: RTCPeerConnectionState) => {
    console.log("setConnectionStateHandler", state);
    if (state === "connected") {
      console.log("connected: rtc connection is established");

      // update local store with call connected status
      // dispatch(callConnected(currentCall.peerUserId, currentCall.startTime));
    }
  });

  setIceConnectionStateHandler(async (state: RTCIceConnectionState) => {
    console.log("setIceConnectionStateHandler", state);
    if (state === "disconnected") {
      console.log("disconnected: rtc ice connection is no longer stable");

      // update local store with call completed status
      dispatch(
        callCompleted(
          currentCall.peerUserId,
          currentCall.startTime,
          new Date().getTime()
        )
      );

      closeMedia();
    } else if (state === "connected") {
      await sendMedia();

      // update local store with call connected status
      dispatch(callConnected(currentCall.peerUserId, currentCall.startTime));
    }
  });

  if (
    !dialed &&
    !incoming &&
    currentCall.callState === RtcCallState.INITIATED
  ) {
    callPeer();
  }

  // run this once
  useEffect(() => {
    let unlocked = false;
    document.body.addEventListener("touchstart", function() {
      if (!unlocked && document.querySelector("#ring")) {
        unlocked = true;
        const audioElem = document.querySelector("#ring") as any;
        audioElem.play();
        audioElem.pause();
        audioElem.currentTime = 0;
      }
    });
    document.addEventListener("click", function() {
      if (!unlocked && document.querySelector("#ring")) {
        unlocked = true;
        const audioElem = document.querySelector("#ring") as any;
        audioElem.play();
        audioElem.pause();
        audioElem.currentTime = 0;
      }
    });

    if (cordova && cordova.plugins && cordova.plugins.iosrtc) {
      cordova.plugins.iosrtc.registerGlobals();

      let needMic = true;
      let needCamera = true;
      cordova.plugins.iosrtc.requestPermission(needMic, needCamera, function (permissionApproved: any) {
        // permissionApproved will be true if user accepted permission otherwise will be false.
        console.error('requestPermission status: ', permissionApproved ? 'Approved' : 'Rejected');
      });
      
      let localDeviceId = "init";
      navigator.mediaDevices.enumerateDevices().then(function(devices: any) {
          var newDevice = devices.filter(function(device: any) {
              return device.kind === 'videoinput';
          }).find(function(device: any, idx :any) {
              return device.deviceId !== 'default';
          });

          localDeviceId = newDevice ? newDevice.deviceId : null;
      });
      console.log('device ', localDeviceId);
    }
  }, []);

  return (
    <Wrapper displayed={views.Rtc}>
      <Header>
        <Title>Call</Title>
        <CloseButton
          onClick={() => {
            closeCall();
          }}
        >
          <CrossIcon color={theme.colors.normalText} title="close" />
        </CloseButton>
      </Header>
      <Body>
        <button
          disabled={
            currentCall.callState !== RtcCallState.INITIATED &&
            currentCall.callState !== RtcCallState.RECEIVING
          }
          onClick={toggleVideo}
        >
          Video ({video ? "on" : "off"})
        </button>
        <button
          disabled={
            currentCall.callState !== RtcCallState.INITIATED &&
            currentCall.callState !== RtcCallState.RECEIVING
          }
          onClick={toggleAudio}
        >
          Audio ({audio ? "on" : "off"})
        </button>
        {(currentCall.callState === RtcCallState.INITIATED ||
          currentCall.callState === RtcCallState.ACCEPTED ||
          currentCall.callState === RtcCallState.RECEIVING ||
          currentCall.callState === RtcCallState.CONNECTED) && (
          <button onClick={endCall}>End Call</button>
        )}
        <VideoWrapper>
          {isIncomingCall() && (
            <div>
              <div>&nbsp;</div>
              <button onClick={answerCall}>Answer</button>
            </div>
          )}
          <RemoteVideoWrapper>
            <RemoteVideo
              id="remotevideo"
              autoPlay={true}
              playsInline={true}
            ></RemoteVideo>
            <audio id="remoteaudio" autoPlay={true}></audio>
          </RemoteVideoWrapper>
          <LocalVideoWrapper>
            <MyVideo
              id="myvideo"
              autoPlay={true}
              playsInline={true}
              muted={true}
            ></MyVideo>
          </LocalVideoWrapper>
        </VideoWrapper>
        <audio id="ring" src="/ring.wav" preload="preload" loop={true}></audio>
      </Body>
      <CallStatus>{getStateDisplayString()}</CallStatus>
    </Wrapper>
  );
};

export { RtcDisplay };
