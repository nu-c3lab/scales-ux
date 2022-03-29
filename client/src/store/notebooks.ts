import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "store";
import { authSelector } from "store/auth";
import { useSelector, useDispatch } from "react-redux";
import { authorizationHeader } from "utils";
import config from "config";

interface InitialState {
  loadingNotebooks: boolean;
  hasErrors: boolean;
  notebooks: any;
}

export const initialState: InitialState = {
  loadingNotebooks: true,
  hasErrors: false,
  notebooks: [],
};

const notebooksSlice = createSlice({
  name: "notebooks",
  initialState,
  reducers: {
    fetchNotebooks: (state) => ({
      ...state,
      loadingNotebooks: true,
    }),
    fetchNotebooksSuccess: (state, { payload }) => ({
      ...state,
      notebooks: payload,
      loadingNotebooks: false,
      hasErrors: false,
    }),
    fetchNotebooksFailure: (state) => ({
      ...state,
      loadingNotebooks: false,
      hasErrors: true,
    }),
  },
});

export const notebooksActions = notebooksSlice.actions;

// Selectors
export const notebooksSelector = (state: RootState) => state?.notebooks;

// The reducer
export default notebooksSlice.reducer;

export function fetchNotebooks() {
  return async (dispatch: AppDispatch, getState) => {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);

    dispatch(notebooksActions.fetchNotebooks());

    try {
      const response = await fetch(
        `${config.SERVER_API_URL}/notebooks`,
        {
          method: "GET",
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        },
      );
      const { data } = await response.json();

      dispatch(notebooksActions.fetchNotebooksSuccess(data.notebooks));
    } catch (error) {
      console.log(error);
      dispatch(notebooksActions.fetchNotebooksFailure());
    }
  };
}

export const useNotebooks = () => {
  const { loadingNotebooks, hasErrors, notebooks } =
    useSelector(notebooksSelector);
  const dispatch = useDispatch();

  return {
    loadingNotebooks,
    hasErrors,
    notebooks,
    fetchNotebooks: () => dispatch(fetchNotebooks()),
  };
};
