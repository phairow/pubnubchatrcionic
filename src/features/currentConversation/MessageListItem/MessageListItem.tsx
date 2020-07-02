import React, { ReactNode } from "react";
import { useSelector, useDispatch } from "react-redux";
import convertTimestampToTime from "foundations/utilities/convertTimestampToTime";
import {
  Wrapper,
  Body,
  Header,
  Avatar,
  SenderName,
  TimeSent
} from "./MessageListItem.style";
import { MessageDisplay } from "features/messages/MessageDisplay";
import { AppMessage } from "features/messages/messageModel";
import { getUsersById } from "features/users/userModel";
import { userDetailViewDisplayed } from "../../layout/LayoutActions";
import { selectUser } from "../../userDetail/userDetailModel";

// TODO: Explain message fragment
export interface MessageFragment {
  sender: {
    id: string;
    name: string;
  };
  timetoken: string;
  message: AppMessage;
}

interface MessageProps {
  messageFragment: MessageFragment;
  avatar: ReactNode;
}

/**
 * Display a message as it appears in a list
 */
const MessageListItem = ({ messageFragment, avatar }: MessageProps) => {
  const dispatch = useDispatch();
  let sender = messageFragment.sender;
  const usersById = useSelector(getUsersById);
  let hasSender = false;

  const openUserDetailsOverlay = () => {
    if (hasSender) {
      // don't open overlay for PubNub Bot
      dispatch(selectUser(messageFragment.sender.id));
      dispatch(userDetailViewDisplayed());
    }
  };

  if (messageFragment.sender && messageFragment.sender.id) {
    const user = usersById[messageFragment.sender.id];
    hasSender = user !== undefined;
  }
  return (
    <Wrapper>
      <Avatar>{avatar}</Avatar>
      <Body>
        <Header>
          <SenderName showDetails={hasSender} onClick={openUserDetailsOverlay}>
            {sender.name}
          </SenderName>
          <TimeSent>
            {convertTimestampToTime(messageFragment.timetoken)}
          </TimeSent>
        </Header>
        <MessageDisplay message={messageFragment.message}></MessageDisplay>
      </Body>
    </Wrapper>
  );
};

export { MessageListItem };
