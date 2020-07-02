import RtcSettings from "config/rtcSettings.json";

const ICE_CONFIG = RtcSettings.rtcIceConfig;
const VIDEO_CONSTRAINTS = RtcSettings.rtcVideoConstraints;

interface RtcState {
  peerConnection: RTCPeerConnection;
  userMediaStream?: MediaStream;
  userMediaClones: MediaStream[];
  inboundStream?: MediaStream;
  negotiatingOffer: boolean;
  negotiatingAnswer: boolean;
  iceCandidates: RTCIceCandidate[];
  iceCandidateHandler: (candidate: RTCIceCandidate | null) => void;
  negotiationNeededHandler: (event: Event) => void;
  trackHandler: (event: RTCTrackEvent) => void;
  connectionStateHandler: (state: RTCPeerConnectionState) => void;
  iceConnectionStateHandler: (state: RTCIceConnectionState) => void;
}

let state: RtcState = {
  peerConnection: new RTCPeerConnection(),
  userMediaStream: undefined,
  userMediaClones: [],
  inboundStream: undefined,
  negotiatingOffer: false,
  negotiatingAnswer: false,
  iceCandidates: [],
  iceCandidateHandler: (candidate: RTCIceCandidate | null) => {
    console.log("default ice candidate handler");
  },
  negotiationNeededHandler: (event: Event) => {
    console.log("default negotiation needed handler");
  },
  trackHandler: (event: RTCTrackEvent) => {
    console.log("default track handler");
  },
  connectionStateHandler: (state: RTCPeerConnectionState) => {
    console.log("default connection state handler: ", state);
  },
  iceConnectionStateHandler: (state: RTCIceConnectionState) => {
    console.log("default ice connection state handler: ", state);
  }
};

export const createPeerConnection = async () => {
  console.log("create peer connection");

  state.negotiatingOffer = false;
  state.negotiatingAnswer = false;
  state.inboundStream = undefined;
  state.iceCandidates = [];

  if (state.peerConnection.connectionState !== "closed") {
    try {
      console.log("create peer connection: closing previous peer connection");
      state.peerConnection.close();
      await disconnectMedia();
    } catch (e) {
      console.log("error closing peer connection: ", e);
    }
  }

  console.log("create peer connection: creating new peer connection");
  state.peerConnection = new RTCPeerConnection({
    iceServers: ICE_CONFIG
  });

  state.peerConnection.onicecandidate = event => {
    console.log('peer connection icecandidate event');
    return state.iceCandidateHandler(event.candidate);
  };

  state.peerConnection.onnegotiationneeded = event => {
    console.log('peer connection negotiationneeded event');
    return state.negotiationNeededHandler(event);
  };

  state.peerConnection.addEventListener('track', event => {
    console.log('peer connection track event');
    return state.trackHandler(event);
  });

  state.peerConnection.addEventListener('connectionstatechange', event => {
    console.log(
    "onconnectionstatechange - connectionState: ",
    state.peerConnection.connectionState
  );
    return state.connectionStateHandler(state.peerConnection.connectionState);
  });

  state.peerConnection.addEventListener('iceconnectionstatechange', event => {
    console.log(
      "oniceconnectionstatechange - iceConnectionState: ",
      state.peerConnection.iceConnectionState
    );
    return state.iceConnectionStateHandler(state.peerConnection.iceConnectionState);
  });

  state.peerConnection.onicegatheringstatechange = event => {
    console.log(
      "onicegatheringstatechange - iceGatheringState: ",
      state.peerConnection.iceGatheringState
    );
  };

  state.peerConnection.onsignalingstatechange = event => {
    console.log(
      "onsignalingstatechange - signalingState: ",
      state.peerConnection.signalingState
    );
  };
};

export const connectMedia = async (constraints: MediaStreamConstraints) => {
  console.log("connect media ", constraints);

  if (!constraints.audio && !constraints.video) {
    console.log("connect media: audio and video both false. exiting.");
    return;
  }

  if (!state.userMediaStream) {
    console.log("connect media: getting user media");
    const stream = await navigator.mediaDevices.getUserMedia({
      ...constraints,
      video: constraints.video ? VIDEO_CONSTRAINTS : false
    });

    state.userMediaClones.push(stream);
    state.userMediaStream = stream.clone();
  }

  return state.userMediaStream;
};

export const disconnectMedia = async () => {
  state.peerConnection.close();

  state.userMediaClones.forEach((stream: MediaStream) => {
    stream.getTracks().forEach(track => track.stop());
  });

  if (state.userMediaStream) {
    state.userMediaStream.getTracks().forEach(track => track.stop());
    state.userMediaStream = undefined;
  }

  if (state.inboundStream) {
    state.inboundStream.getTracks().forEach(track => track.stop());
    state.inboundStream = undefined;
  }
};

export const sendMedia = async () => {
  console.log("send media");

  if (state.userMediaStream) {
    console.log("send media: adding tracks");

    const stream = state.userMediaStream;

    // stream.getVideoTracks().forEach(track => {
    //   track.applyConstraints(VIDEO_CONSTRAINTS);
    // });

    stream.getTracks().forEach(track => {
      state.peerConnection.addTrack(track, stream);
    });

    console.log("send media: tracks added");
  }
};

export const createIceOffer = async () => {
  const offer = await state.peerConnection.createOffer();

  console.log("createIceOffer: attempting local offer", offer);

  try {
    await state.peerConnection.setLocalDescription(offer);
    console.log(
      "createIceOffer: created: ",
      state.peerConnection.localDescription
    );
  } catch (e) {
    console.log("createIceOffer: error setting local offer: ", e);
  }

  return state.peerConnection.localDescription;
};

export const negotiateIceOffer = async () => {
  const offer = await state.peerConnection.createOffer();

  if (state.peerConnection.signalingState !== "stable") return;

  console.log("negotiateIceOffer: attempting local offer", offer);

  try {
    if (
      state.peerConnection.signalingState === "stable" ||
      state.peerConnection.signalingState === "have-local-offer" ||
      state.peerConnection.signalingState === "have-remote-pranswer"
    ) {
      await state.peerConnection.setLocalDescription(offer);
      console.log(
        "negotiateIceOffer: created: ",
        state.peerConnection.localDescription
      );
    } else {
      console.log(
        "negotiateIceOffer: invalid state to set local description: ",
        state.peerConnection.signalingState
      );
    }
  } catch (e) {
    console.log("negotiateIceOffer: error setting local offer: ", e);
  }

  return state.peerConnection.localDescription;
};

export const createIceAnswer = async () => {
  if (
    state.peerConnection.signalingState === "stable" ||
    state.peerConnection.signalingState === "have-remote-offer" ||
    state.peerConnection.signalingState === "have-local-pranswer"
  ) {
    const answer = await state.peerConnection.createAnswer();

    console.log("createIceAnswer: attempting local answer", answer);

    try {
      if (
        state.peerConnection.signalingState === "stable" ||
        state.peerConnection.signalingState === "have-local-pranswer" ||
        state.peerConnection.signalingState === "have-remote-offer"
      ) {
        await state.peerConnection.setLocalDescription(answer);
        console.log(
          "createIceAnswer: created: ",
          state.peerConnection.localDescription
        );
      } else {
        console.log(
          "createIceAnswer: invalid state to set local description: ",
          state.peerConnection.signalingState
        );
      }
    } catch (e) {
      console.log("createIceAnswer: error setting local answer: ", e);
    }
  } else {
    console.log(
      "createIceAnswer: invalid state to create answer: ",
      state.peerConnection.signalingState
    );
  }

  return state.peerConnection.localDescription;
};

export const setLocalDescription = async (offer: RTCSessionDescription) => {
  console.log(
    "setLocalDescription: ",
    state.negotiatingOffer,
    state.peerConnection.signalingState
  );

  try {
    if (
      state.peerConnection.signalingState === "stable" ||
      state.peerConnection.signalingState === "have-local-offer" ||
      state.peerConnection.signalingState === "have-remote-pranswer"
    ) {
      await state.peerConnection.setLocalDescription(offer);
    } else {
      console.log(
        "invalid state to set local description: ",
        state.peerConnection.signalingState
      );
    }
  } catch (e) {
    console.log("setLocalDescription: error setting remote desc: ", e);
  }
};

export const setRemoteDescription = async (offer: RTCSessionDescription) => {
  console.log(
    "setRemoteDescription: ",
    state.negotiatingOffer,
    state.peerConnection.signalingState
  );

  try {
    if (
      state.peerConnection.signalingState === "stable" ||
      state.peerConnection.signalingState === "have-local-offer" ||
      state.peerConnection.signalingState === "have-remote-offer" ||
      state.peerConnection.signalingState === "have-local-pranswer" ||
      state.peerConnection.signalingState === "have-remote-pranswer"
    ) {
      await state.peerConnection.setRemoteDescription(offer);
    } else {
      console.log(
        "invalid state to set remote description: ",
        state.peerConnection.signalingState
      );
    }
  } catch (e) {
    console.log("setRemoteDescription: error setting remote desc: ", e);
  }

  state.iceCandidates.forEach(candidate => {
    state.peerConnection.addIceCandidate(candidate);
  });
};

export const addIceCandidate = async (candidate: RTCIceCandidate) => {
  console.log("ice candidate adding", candidate);
  if (
    !state.peerConnection.remoteDescription ||
    !state.peerConnection.remoteDescription.type
  ) {
    state.iceCandidates.push(candidate);
  } else {
    state.iceCandidates.forEach(candidate => {
      state.peerConnection.addIceCandidate(candidate);
    });
    state.peerConnection.addIceCandidate(candidate);
  }
};

export const setIceCandidateHandler = (
  handler: (candidate: RTCIceCandidate | null) => void
) => {
  state.iceCandidateHandler = handler;
};

export const setNegotiationNeededHandler = (
  handler: (event: Event) => void
) => {
  state.negotiationNeededHandler = handler;
};

export const setTrackHandler = (handler: (event: RTCTrackEvent) => void) => {
  state.trackHandler = handler;
};

export const setConnectionStateHandler = (
  handler: (state: RTCPeerConnectionState) => void
) => {
  state.connectionStateHandler = handler;
};

export const setIceConnectionStateHandler = (
  handler: (state: RTCIceConnectionState) => void
) => {
  state.iceConnectionStateHandler = handler;
};
