import React from "react";
import { Wrapper } from "./ChatUI.style";
import { Menu } from "features/chat/Menu/Menu";
import { CurrentConversation } from "features/currentConversation/CurrentConversation/CurrentConversation";
import { ConversationMembers } from "features/conversationMembers/ConversationMembers/ConversationMembers";
import { JoinConversationDialog } from "features/joinedConversations/JoinConversationDialog/JoinConversationDialog";
import { UserDetailDialog } from "features/userDetail/UserDetailDialog/UserDetailDialog";
import { RtcDisplay } from "features/rtc/RtcDisplay/RtcDisplay";

const ChatUI = () => {
  return (
    <Wrapper>
      <Menu />
      <CurrentConversation />
      <ConversationMembers />
      <JoinConversationDialog />
      <UserDetailDialog />
      <RtcDisplay></RtcDisplay>
    </Wrapper>
  );
};

export { ChatUI };
