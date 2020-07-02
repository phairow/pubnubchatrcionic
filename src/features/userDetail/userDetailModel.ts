import { AppState } from "main/storeTypes";
import { createSelector } from "reselect";
import { AppActions } from "../../main/AppActions";

export const SELECT_USER = "SELECT_USER";

export const selectUser = (userId: string): userSelectedAction => ({
  type: SELECT_USER,
  payload: {
    selectedUserId: userId
  }
});

type userSelectedPayloadType = {
  selectedUserId: string;
};
export interface UserDetailState {
  selectedUserId: string;
}

export interface userSelectedAction {
  type: typeof SELECT_USER;
  payload: userSelectedPayloadType;
}

const initialState: UserDetailState = {
  selectedUserId: ""
};

const UserDetailStateReducer = (
  state: UserDetailState = initialState,
  action: AppActions
): UserDetailState => {
  switch (action.type) {
    case SELECT_USER: {
      return { ...state, selectedUserId: action.payload.selectedUserId };
    }
    default:
      return state;
  }
};

const getUserDetailStateSlice = (state: AppState) => state.userDetail;

export const getSelectedUserId = createSelector(
  getUserDetailStateSlice,
  (userDetail: UserDetailState): string => {
    return userDetail.selectedUserId;
  }
);

export { UserDetailStateReducer };
