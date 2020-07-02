import React from "react";
import { Content } from "./RtcMessageDisplay.style";
import { RtcIceMessage, RtcCallMessage, MessageType } from "../messageModel";

type RtcMessageProps = {
  message: RtcIceMessage | RtcCallMessage;
};

/**
 * Display a Rtc messages
 */
export const RtcMessageDisplay = ({ message }: RtcMessageProps) => {
  if (message.type === MessageType.RtcIce) {
    return (
      <Content>
        Ice - {message.iceSignalType} - {JSON.stringify(message)}
      </Content>
    );
  } else {
    return (
      <Content>
        Signal - from: {message.senderId} - {message.callSignalType} -
        startTime: {message.startTime}
      </Content>
    );
  }
};
