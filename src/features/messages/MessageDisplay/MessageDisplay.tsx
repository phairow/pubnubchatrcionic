import React from "react";
import invariant from "invariant";
import { TextMessageDisplay } from "features/messages/TextMessageDisplay";
import { RtcMessageDisplay } from "features/messages/RtcMessageDisplay";
import { MessageType, AppMessage } from "features/messages/messageModel";

type MessageProps = {
  message: AppMessage;
};

/**
 * Display a Message based on its type
 */
export const MessageDisplay = ({ message }: MessageProps) => {
  switch (message.type) {
    case MessageType.Text:
      return <TextMessageDisplay message={message}></TextMessageDisplay>;
    case MessageType.RtcIce:
    case MessageType.RtcCall:
      return <RtcMessageDisplay message={message}></RtcMessageDisplay>;
    default:
      invariant(
        false,
        `No component available for displaying message of type "${
          (message as any).type
        }"`
      );
  }
};
