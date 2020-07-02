import { LayoutActionType } from "./LayoutActionType";

export interface menuViewHiddenAction {
  type: typeof LayoutActionType.MENU_VIEW_HIDDEN;
}

export interface currentConversationViewHiddenAction {
  type: typeof LayoutActionType.CURRENT_CONVERSATION_VIEW_HIDDEN;
}

export interface conversationMembersViewHiddenAction {
  type: typeof LayoutActionType.CONVERSATION_MEMBERS_VIEW_HIDDEN;
}

export interface joinConversationViewHiddenAction {
  type: typeof LayoutActionType.JOIN_CONVERSATION_VIEW_HIDDEN;
}

export interface menuViewDisplayedAction {
  type: typeof LayoutActionType.MENU_VIEW_DISPLAYED;
}

export interface currentConversationViewDisplayedAction {
  type: typeof LayoutActionType.CURRENT_CONVERSATION_VIEW_DISPLAYED;
}

export interface conversationMembersViewDisplayedAction {
  type: typeof LayoutActionType.CONVERSATION_MEMBERS_VIEW_DISPLAYED;
}

export interface joinConversationViewDisplayedAction {
  type: typeof LayoutActionType.JOIN_CONVERSATION_VIEW_DISPLAYED;
}
export interface userDetailViewDisplayedAction {
  type: typeof LayoutActionType.USER_DETAIL_VIEW_DISPLAYED;
}
export interface userDetailViewHiddenAction {
  type: typeof LayoutActionType.USER_DETAIL_VIEW_HIDDEN;
}

export interface rtcViewDisplayedAction {
  type: typeof LayoutActionType.RTC_VIEW_DISPLAYED;
}
export interface rtcViewHiddenAction {
  type: typeof LayoutActionType.RTC_VIEW_HIDDEN;
}

export type LayoutActions =
  | menuViewHiddenAction
  | currentConversationViewHiddenAction
  | conversationMembersViewHiddenAction
  | joinConversationViewHiddenAction
  | menuViewDisplayedAction
  | currentConversationViewDisplayedAction
  | conversationMembersViewDisplayedAction
  | joinConversationViewDisplayedAction
  | userDetailViewDisplayedAction
  | userDetailViewHiddenAction
  | rtcViewDisplayedAction
  | rtcViewHiddenAction;

export const menuViewDisplayed = (): menuViewDisplayedAction => {
  return {
    type: LayoutActionType.MENU_VIEW_DISPLAYED
  };
};

export const joinConversationViewDisplayed = (): joinConversationViewDisplayedAction => {
  return {
    type: LayoutActionType.JOIN_CONVERSATION_VIEW_DISPLAYED
  };
};

export const userDetailViewDisplayed = (): userDetailViewDisplayedAction => {
  return {
    type: LayoutActionType.USER_DETAIL_VIEW_DISPLAYED
  };
};

export const rtcViewDisplayed = (): rtcViewDisplayedAction => {
  return {
    type: LayoutActionType.RTC_VIEW_DISPLAYED
  };
};

export const currentConversationViewDisplayed = (): currentConversationViewDisplayedAction => {
  return {
    type: LayoutActionType.CURRENT_CONVERSATION_VIEW_DISPLAYED
  };
};

export const conversationMembersViewDisplayed = (): conversationMembersViewDisplayedAction => {
  return {
    type: LayoutActionType.CONVERSATION_MEMBERS_VIEW_DISPLAYED
  };
};

export const menuViewHidden = (): menuViewHiddenAction => {
  return {
    type: LayoutActionType.MENU_VIEW_HIDDEN
  };
};

export const joinConversationViewHidden = (): joinConversationViewHiddenAction => {
  return {
    type: LayoutActionType.JOIN_CONVERSATION_VIEW_HIDDEN
  };
};

export const userDetailViewHidden = (): userDetailViewHiddenAction => {
  return {
    type: LayoutActionType.USER_DETAIL_VIEW_HIDDEN
  };
};

export const rtcViewHidden = (): rtcViewHiddenAction => {
  return {
    type: LayoutActionType.RTC_VIEW_HIDDEN
  };
};

export const currentConversationViewHidden = (): currentConversationViewHiddenAction => {
  return {
    type: LayoutActionType.CURRENT_CONVERSATION_VIEW_HIDDEN
  };
};

export const conversationMembersViewHidden = (): conversationMembersViewHiddenAction => {
  return {
    type: LayoutActionType.CONVERSATION_MEMBERS_VIEW_HIDDEN
  };
};
