import React from "react";
import { UserInitialsAvatar } from "foundations/components/UserInitialsAvatar";
import { selectUser } from "../../userDetail/userDetailModel";
import { useDispatch } from "react-redux";
import { userDetailViewDisplayed } from "../../layout/LayoutActions";

import {
  Wrapper,
  Avatar,
  About,
  PresenceDot,
  UserName,
  UserTitle
} from "./MemberDescription.style";

export interface UserFragment {
  name: string;
  id: string;
  custom: {
    title: string;
  };
  profileUrl: string;
  presence: boolean;
}

interface MemberDescriptionProps {
  user: UserFragment;
  you: boolean;
}

const MemberDescription = ({ user, you }: MemberDescriptionProps) => {
  const dispatch = useDispatch();

  const openUserDetailsOverlay = () => {
    dispatch(selectUser(user.id));
    dispatch(userDetailViewDisplayed());
  };

  return (
    <Wrapper>
      <Avatar>
        <UserInitialsAvatar
          size={36}
          name={user.name}
          userId={user.id}
          muted={!user.presence}
        />
        {user.presence && <PresenceDot presence={user.presence} size={7} />}
      </Avatar>
      <About>
        <UserName muted={!user.presence} onClick={openUserDetailsOverlay}>
          {user.name}
          {you && " (you)"}
        </UserName>
        <UserTitle muted={!user.presence}>{user.custom.title}</UserTitle>
      </About>
    </Wrapper>
  );
};

export { MemberDescription };
