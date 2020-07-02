import React, { useContext } from "react";
import { getViewStates } from "features/layout/Selectors";
import { useSelector, useDispatch } from "react-redux";
import { CrossIcon } from "foundations/components/icons/CrossIcon";
import {
  Call,
  CloseButton,
  Title,
  Header,
  UserName
} from "./UserDetailDialog.style";
import {
  Overlay,
  Modal,
  getAnimatedModalVariants
} from "foundations/components/Modal";
import { ThemeContext } from "styled-components";
import { useMediaQuery } from "foundations/hooks/useMediaQuery";
import {
  rtcViewDisplayed,
  userDetailViewHidden
} from "../../layout/LayoutActions";
import { getSelectedUserId } from "../userDetailModel";
import { getUsersById } from "../../users/userModel";
import { PresenceIndicatorIcon } from "../../../foundations/components/icons/PresenceIndicatorIcon";
import { getPresenceByConversationId } from "features/memberPresence/memberPresenceModel";
import { getCurrentConversationId } from "features/currentConversation/currentConversationModel";
import { outgoingCallInitiated } from "../../rtc/RtcModel";
import { getLoggedInUserId } from "../../authentication/authenticationModel";

const UserDetailDialog = () => {
  const dispatch = useDispatch();
  const views = useSelector(getViewStates);
  const theme = useContext(ThemeContext);
  const isMedium = useMediaQuery(theme.mediaQueries.medium);
  const loggedInUserId = useSelector(getLoggedInUserId);
  const selectedUserId = useSelector(getSelectedUserId);
  const usersById = useSelector(getUsersById);
  const currentConversationId = useSelector(getCurrentConversationId);
  const presenceByConversationId = useSelector(getPresenceByConversationId);
  const user = usersById[selectedUserId];
  const userName = user ? user.name : "";
  const present = presenceByConversationId[currentConversationId];
  const isConnected =
    present &&
    present.occupants.filter(occupant => {
      return occupant.uuid === selectedUserId;
    }).length > 0;

  const initiateCall = () => {
    dispatch(outgoingCallInitiated(selectedUserId, new Date().getTime()));
    dispatch(rtcViewDisplayed());
  };

  return (
    <Overlay displayed={views.UserDetail}>
      <Modal
        animate={views.UserDetail ? "open" : "closed"}
        variants={getAnimatedModalVariants(isMedium)}
      >
        <Header>
          <Title>
            <UserName>{userName}</UserName>
            {isConnected && (
              <PresenceIndicatorIcon
                size={7}
                title={isConnected ? "connected" : "not connected"}
                active={isConnected}
              />
            )}
          </Title>
          <CloseButton
            onClick={() => {
              dispatch(userDetailViewHidden());
            }}
          >
            <CrossIcon color={theme.colors.normalText} title="close" />
          </CloseButton>
        </Header>
        {loggedInUserId !== selectedUserId && (
          <Call isConnected={isConnected} onClick={initiateCall}>
            Initiate a call
            {isConnected || " (" + userName + " may not be online)"}
          </Call>
        )}
        {loggedInUserId === selectedUserId && <div>My Profile</div>}
      </Modal>
    </Overlay>
  );
};

export { UserDetailDialog };
