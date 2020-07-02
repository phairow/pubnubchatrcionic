import Pubnub from "pubnub";
import { sendMessage as sendPubnubMessage, Message } from "pubnub-redux";
import {
  MessageType,
  RtcCallMessage,
  RtcIceMessage
} from "features/messages/messageModel";
import { RtcCallSignalType } from "./RtcCallSignalType.enum";
import { RtcIceSignalType } from "./RtcIceSignalType.enum";
import { AppDispatch } from "main/storeTypes";
import RtcSettings from "config/rtcSettings.json";

const DIALING_TIMEOUT_SECONDS = RtcSettings.rtcDialingTimeoutSeconds;

interface SignalingState {
  pubnub?: Pubnub;
  dispatch?: AppDispatch;
  negotingOffer: boolean;
  pendingOutgoingCalls: {
    [key: string]: { peerId: string; startTime: number };
  };
  pendingIncomingCalls: {
    [key: string]: { peerId: string; startTime: number };
  };
  onCallIncoming: (callerId: string, startTime: number) => void;
  onCallAccepted: (callerId: string, startTime: number) => void;
  onCallEnded: (callerId: string, startTime: number) => void;
  onCallTimeout: (callerId: string, startTime: number) => void;
  onIceCandidate: (
    callerId: string,
    startTime: number,
    candidate: RTCIceCandidate | null
  ) => void;
  onIceOffer: (
    callerId: string,
    startTime: number,
    offer: RTCSessionDescription
  ) => void;
  onIceAnswer: (
    callerId: string,
    startTime: number,
    offer: RTCSessionDescription
  ) => void;
}

const state: SignalingState = {
  pubnub: undefined,
  dispatch: undefined,
  negotingOffer: false,
  pendingOutgoingCalls: {},
  pendingIncomingCalls: {},
  onCallIncoming: (callerId: string, startTime: number) => {},
  onCallAccepted: (callerId: string, startTime: number) => {},
  onCallEnded: (callerId: string, startTime: number) => {},
  onCallTimeout: (callerId: string, startTime: number) => {},
  onIceCandidate: (
    callerId: string,
    startTime: number,
    candidate: RTCIceCandidate | null
  ) => {},
  onIceOffer: (
    callerId: string,
    startTime: number,
    offer: RTCSessionDescription
  ) => {},
  onIceAnswer: (
    callerId: string,
    startTime: number,
    offer: RTCSessionDescription
  ) => {}
};

const pubnubIceListener: Pubnub.ListenerParameters = {};

// initialize signaling
export const init = async (pubnub: Pubnub, dispatch: AppDispatch) => {
  state.pubnub = pubnub;
  state.dispatch = dispatch;
  state.negotingOffer = false;

  if (state.pubnub) {
    pubnub.removeListener(pubnubIceListener);
  }

  pubnubIceListener.message = async message => {
    console.log("message", message);
    if (message.message.type === MessageType.RtcCall) {
      handleCallMessage(message.message as RtcCallMessage);
    } else if (message.message.type === MessageType.RtcIce) {
      handleIceMessage(message.message as RtcIceMessage);
    }
  };

  pubnub.addListener(pubnubIceListener);
};

const setHandlers = (
  onCallIncoming: (callerId: string, startTime: number) => void,
  onCallAccepted: (callerId: string, startTime: number) => void,
  onCallEnded: (callerId: string, startTime: number) => void,
  onCallTimeout: () => void,
  onIceCandidate: (
    callerId: string,
    startTime: number,
    candidate: RTCIceCandidate | null
  ) => void,
  onIceOffer: (
    callerId: string,
    startTime: number,
    offer: RTCSessionDescription
  ) => void,
  onIceAnswer: (
    callerId: string,
    startTime: number,
    offer: RTCSessionDescription
  ) => void
) => {
  console.log("setting rtc signaling handlers");
  state.onCallIncoming = onCallIncoming;
  state.onCallAccepted = onCallAccepted;
  state.onCallEnded = onCallEnded;
  state.onCallTimeout = onCallTimeout;
  state.onIceCandidate = onIceCandidate;
  state.onIceOffer = onIceOffer;
  state.onIceAnswer = onIceAnswer;
};

const handleCallMessage = (callMessage: RtcCallMessage) => {
  console.log(callMessage);
  switch (callMessage.callSignalType) {
    case RtcCallSignalType.INITIATE:
      console.log("call received from peer: ", callMessage.senderId);

      try {
        const callKey = callMessage.senderId + callMessage.startTime;
        state.pendingIncomingCalls[callKey] = {
          peerId: callMessage.senderId,
          startTime: callMessage.startTime
        };

        setTimeout(() => {
          const callValue = state.pendingIncomingCalls[callKey];

          if (callValue) {
            delete state.pendingIncomingCalls[callKey];
            state.onCallTimeout(callValue.peerId, callValue.startTime);
          }
        }, DIALING_TIMEOUT_SECONDS * 1000);

        state.onCallIncoming(callMessage.senderId, callMessage.startTime);
      } catch (e) {
        console.log("call incoming: error on incoming call: ", e);
      }

      break;
    case RtcCallSignalType.ACCEPT:
      console.log("call accepted by peer: ", callMessage.senderId);

      try {
        const callKey = callMessage.senderId + callMessage.startTime;
        const callValue = state.pendingOutgoingCalls[callKey];

        if (callValue) {
          delete state.pendingOutgoingCalls[callKey];
        }
        state.onCallAccepted(callMessage.senderId, callMessage.startTime);
      } catch (e) {
        console.log("call accepted: error on accepted call: ", e);
      }

      break;
    case RtcCallSignalType.END:
      console.log("call ended by peer: ", callMessage.senderId);

      try {
        const callKey = callMessage.senderId + callMessage.startTime;
        const callValueIncoming = state.pendingIncomingCalls[callKey];
        const callValueOutgoing = state.pendingOutgoingCalls[callKey];

        if (callValueIncoming) {
          delete state.pendingIncomingCalls[callKey];
        }

        if (callValueOutgoing) {
          delete state.pendingOutgoingCalls[callKey];
        }

        state.onCallEnded(callMessage.senderId, callMessage.startTime);
      } catch (e) {
        console.log("call ended: error on ended call: ", e);
      }

      break;
  }
};

const handleIceMessage = (iceMessage: RtcIceMessage) => {
  switch (iceMessage.iceSignalType) {
    case RtcIceSignalType.CANDIDATE:
      console.log("candidate received from peer", iceMessage.candidate);

      try {
        if (iceMessage.candidate || iceMessage.candidate === null) {
          state.onIceCandidate(
            iceMessage.senderId,
            iceMessage.startTime,
            iceMessage.candidate
          );
        } else {
          console.log("candidate empty: ", iceMessage);
        }
      } catch (e) {
        console.log("candidate: error setting ice candidate: ", e);
      }

      break;
    case RtcIceSignalType.OFFER:
      console.log("offer received from peer", iceMessage.offer);

      if (state.negotingOffer) {
        // exit if already negotiating offer
        return;
      }

      try {
        if (iceMessage.offer) {
          state.onIceOffer(
            iceMessage.senderId,
            iceMessage.startTime,
            iceMessage.offer
          );
        } else {
          console.log("offer empty: ", iceMessage);
        }
      } catch (e) {
        console.log("candidate: error setting ice offer: ", e);
      }

      break;

    case RtcIceSignalType.ANSWER:
      console.log("answer received from peer", iceMessage.answer);

      try {
        if (iceMessage.answer) {
          state.onIceAnswer(
            iceMessage.senderId,
            iceMessage.startTime,
            iceMessage.answer
          );
        } else {
          console.log("answer empty: ", iceMessage);
        }
      } catch (e) {
        console.log("candidate: error setting ice answer: ", e);
      }

      break;
  }
};

const dispatchSignalingMessage = async (message: Message) => {
  console.log("message to pubnub", message.channel, message.message);

  if (state.dispatch) {
    try {
    await state.dispatch(sendPubnubMessage(message));
      console.log(
        "pubnub message sent: ",
        message
      );
    } catch (e) {
      console.log(
        "error sending pubnub message: ",
        e,
        message
      );
    }
  } else {
    console.log(
      "rtc signaling missing dispatch, unable to dispatch: ",
      message
    );
  }
};

const callInit = async (myId: string, peerId: string, startTime: number) => {
  const message: RtcCallMessage = {
    type: MessageType.RtcCall,
    callSignalType: RtcCallSignalType.INITIATE,
    startTime,
    senderId: myId
  };

  dispatchSignalingMessage({
    channel: peerId,
    message
  });

  const callKey = peerId + startTime;
  state.pendingOutgoingCalls[callKey] = { peerId, startTime };

  setTimeout(() => {
    const callValue = state.pendingOutgoingCalls[callKey];

    if (callValue) {
      delete state.pendingOutgoingCalls[callKey];
      state.onCallTimeout(callValue.peerId, callValue.startTime);
    }
  }, DIALING_TIMEOUT_SECONDS * 1000);
};

const callAccept = async (myId: string, peerId: string, startTime: number) => {
  const message: RtcCallMessage = {
    type: MessageType.RtcCall,
    callSignalType: RtcCallSignalType.ACCEPT,
    startTime,
    senderId: myId
  };

  dispatchSignalingMessage({
    channel: peerId,
    message
  });

  const callKey = peerId + startTime;
  const callValue = state.pendingIncomingCalls[callKey];

  if (callValue) {
    delete state.pendingIncomingCalls[callKey];
  }
};

const callEnd = async (myId: string, peerId: string, startTime: number) => {
  const message: RtcCallMessage = {
    type: MessageType.RtcCall,
    callSignalType: RtcCallSignalType.END,
    startTime,
    senderId: myId
  };

  dispatchSignalingMessage({
    channel: peerId,
    message
  });

  const callKey = peerId + startTime;
  const callValue = state.pendingOutgoingCalls[callKey];

  if (callValue) {
    delete state.pendingOutgoingCalls[callKey];
  }
};

const iceCandidate = async (
  myId: string,
  peerId: string,
  startTime: number,
  candidate: RTCIceCandidate
) => {
  const message: RtcIceMessage = {
    type: MessageType.RtcIce,
    iceSignalType: RtcIceSignalType.CANDIDATE,
    startTime,
    senderId: myId,
    candidate
  };

  dispatchSignalingMessage({
    channel: peerId,
    message
  });
};

const iceOffer = async (
  myId: string,
  peerId: string,
  startTime: number,
  offer: RTCSessionDescription
) => {
  const message: RtcIceMessage = {
    type: MessageType.RtcIce,
    iceSignalType: RtcIceSignalType.OFFER,
    startTime,
    senderId: myId,
    offer
  };

  dispatchSignalingMessage({
    channel: peerId,
    message
  });
};

const iceAnswer = async (
  myId: string,
  peerId: string,
  startTime: number,
  answer: RTCSessionDescription
) => {
  const message: RtcIceMessage = {
    type: MessageType.RtcIce,
    iceSignalType: RtcIceSignalType.ANSWER,
    startTime,
    senderId: myId,
    answer
  };

  dispatchSignalingMessage({
    channel: peerId,
    message
  });
};

export const signaling = {
  init,
  setHandlers,

  // call signals
  callInit,
  callAccept,
  callEnd,

  // ice signals
  iceCandidate,
  iceOffer,
  iceAnswer
};
