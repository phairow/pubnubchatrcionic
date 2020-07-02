import { LayoutActions } from "./LayoutActions";
import { LayoutActionType } from "./LayoutActionType";

export enum View {
  Menu,
  CurrentConversation,
  ConversationMembers,
  JoinConversation,
  UserDetail,
  Rtc
}

interface LayoutState {
  views: View[];
}

const initialState: LayoutState = {
  views: [View.CurrentConversation]
};

const viewDisplayed = (state: LayoutState, view: View): LayoutState => {
  return { ...state, views: [...state.views, view] };
};

const viewHidden = (state: LayoutState, view: View): LayoutState => {
  return { ...state, views: state.views.filter(item => item !== view) };
};

const LayoutStateReducer = (
  state: LayoutState = initialState,
  action: LayoutActions
): LayoutState => {
  switch (action.type) {
    case LayoutActionType.MENU_VIEW_DISPLAYED:
      return viewDisplayed(state, View.Menu);
    case LayoutActionType.MENU_VIEW_HIDDEN:
      return viewHidden(state, View.Menu);
    case LayoutActionType.CURRENT_CONVERSATION_VIEW_DISPLAYED:
      return viewDisplayed(state, View.CurrentConversation);
    case LayoutActionType.CURRENT_CONVERSATION_VIEW_HIDDEN:
      return viewHidden(state, View.CurrentConversation);
    case LayoutActionType.CONVERSATION_MEMBERS_VIEW_DISPLAYED:
      return viewDisplayed(state, View.ConversationMembers);
    case LayoutActionType.CONVERSATION_MEMBERS_VIEW_HIDDEN:
      return viewHidden(state, View.ConversationMembers);
    case LayoutActionType.JOIN_CONVERSATION_VIEW_DISPLAYED:
      return viewDisplayed(state, View.JoinConversation);
    case LayoutActionType.JOIN_CONVERSATION_VIEW_HIDDEN:
      return viewHidden(state, View.JoinConversation);
    case LayoutActionType.USER_DETAIL_VIEW_DISPLAYED:
      return viewDisplayed(state, View.UserDetail);
    case LayoutActionType.USER_DETAIL_VIEW_HIDDEN:
      return viewHidden(state, View.UserDetail);
    case LayoutActionType.RTC_VIEW_DISPLAYED:
      return viewDisplayed(state, View.Rtc);
    case LayoutActionType.RTC_VIEW_HIDDEN:
      return viewHidden(state, View.Rtc);
  }
  return state;
};

export { LayoutStateReducer };
