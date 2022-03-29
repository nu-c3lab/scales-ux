import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "store";
import { authSelector } from "store/auth";
import { authorizationHeader } from "utils";
import { notify } from "reapop";
import { useUnknownErrorNotificationMessage } from "components/Notifications";
import { useSelector, useDispatch } from "react-redux";
import config from "config";

interface InitialState {
  loadingNotebook: boolean;
  creatingNotebook: boolean;
  savingNotebook: boolean;
  deletingNotebook: boolean;
  hasErrors: boolean;
  notebook: any;
}

export const initialState: InitialState = {
  loadingNotebook: true,
  savingNotebook: false,
  creatingNotebook: false,
  deletingNotebook: false,
  hasErrors: false,
  notebook: null,
};

const notebookSlice = createSlice({
  name: "notebook",
  initialState,
  reducers: {
    getNotebook: (state) => ({
      ...state,
      loadingNotebook: true,
    }),
    getNotebookSuccess: (state, { payload }) => ({
      ...state,
      notebook: payload,
      loadingNotebook: false,
      hasErrors: false,
    }),
    getNotebookFailure: (state) => ({
      ...state,
      loadingNotebook: false,
      hasErrors: true,
    }),
    clearNotebook: (state) => ({
      ...state,
      notebook: null,
      loadingNotebook: false,
    }),
    createNotebook: (state) => ({
      ...state,
      creatingNotebook: true,
      hasErrors: false,
    }),
    createNotebookSuccess: (state, { payload }) => ({
      ...state,
      notebook: payload,
      creatingNotebook: false,
      hasErrors: false,
    }),
    createNotebookFailure: (state) => ({
      ...state,
      creatingNotebook: false,
      hasErrors: true,
    }),
    saveNotebook: (state) => ({
      ...state,
      savingNotebook: true,
    }),
    saveNotebookSuccess: (state, { payload }) => ({
      ...state,
      notebook: { ...state.notebook, ...payload },
      savingNotebook: false,
      hasErrors: false,
    }),
    saveNotebookFailure: (state) => ({
      ...state,
      savingNotebook: false,
      hasErrors: true,
    }),
    removeNotebook: (state) => ({
      ...state,
      deletingNotebook: true,
    }),
    removeNotebookSuccess: (state) => ({
      ...state,
      deletingNotebook: false,
      hasErrors: false,
      notebook: null,
    }),
    removeNotebookFailure: (state) => ({
      ...state,
      deletingNotebook: false,
      hasErrors: true,
    }),
  },
});

// Three actions generated from the slice
export const notebookActions = notebookSlice.actions;

// Selectors
export const notebookSelector = (state: RootState) => state.notebook;

// The reducer
export default notebookSlice.reducer;

export function fetchNotebook(id: string) {
  return async (dispatch: AppDispatch, getState) => {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);

    dispatch(notebookActions.getNotebook());

    try {
      const response = await fetch(
        `${config.SERVER_API_URL}/notebooks/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
        },
      );
      if (response.status === 200) {
        const { data } = await response.json();
        dispatch(notebookActions.getNotebookSuccess(data.notebook));
      } else {
        dispatch(notebookActions.getNotebookFailure());
      }
    } catch (error) {
      dispatch(notebookActions.getNotebookFailure());
    }
  };
}

export function updateNotebook(id: string, payload: any) {
  return async (dispatch: AppDispatch, getState) => {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);
    dispatch(notebookActions.saveNotebook());

    try {
      const response = await fetch(
        `${config.SERVER_API_URL}/notebooks/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
          body: JSON.stringify(payload),
        },
      );
      if (response.status === 200) {
        const { data, message } = await response.json();
        dispatch(notify(message, "success"));
        dispatch(notebookActions.saveNotebookSuccess(data.notebook));
      } else {
        dispatch(notify(response.statusText, "error"));
        dispatch(notebookActions.saveNotebookFailure());
      }
    } catch (error) {
      dispatch(notify(useUnknownErrorNotificationMessage, "error"));
      dispatch(notebookActions.saveNotebookFailure());
    }
  };
}

export function createNotebook(payload: any) {
  return async (dispatch: AppDispatch, getState) => {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);
    dispatch(notebookActions.createNotebook());
    try {
      const response = await fetch(
        `${config.SERVER_API_URL}/notebooks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
          body: JSON.stringify(payload),
        },
      );
      const { data, message } = await response.json();
      if (response.status === 200) {
        dispatch(notify(message, "success"));
        dispatch(notebookActions.createNotebookSuccess(data.notebook));
      } else {
        dispatch(notify(message, "error"));
        dispatch(notebookActions.createNotebookFailure());
      }
    } catch (error) {
      dispatch(notebookActions.createNotebookFailure());
    }
  };
}

export function deleteNotebook(id: string) {
  return async (dispatch: AppDispatch, getState) => {
    const { token } = authSelector(getState());
    const authHeader = authorizationHeader(token);
    dispatch(notebookActions.removeNotebook());
    try {
      const response = await fetch(
        `${config.SERVER_API_URL}/notebooks/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
        },
      );
      const { message } = await response.json();
      if (response.status === 200) {
        dispatch(notebookActions.clearNotebook());
        dispatch(notify(message, "success"));
        dispatch(notebookActions.removeNotebookSuccess());
      } else {
        dispatch(notify(message, "error"));
        dispatch(notebookActions.removeNotebookFailure());
      }
    } catch (error) {
      dispatch(notebookActions.removeNotebookFailure());
    }
  };
}

// Hooks
export function useNotebook() {
  const { notebook, loadingNotebook, hasErrors } =
    useSelector(notebookSelector);
  const dispatch = useDispatch();
  return {
    notebook,
    loadingNotebook,
    hasErrors,
    fetchNotebook: (id: string) => dispatch(fetchNotebook(id)),
    updateNotebook: (id: string, payload: any) =>
      dispatch(updateNotebook(id, payload)),
    createNotebook: (payload: any) => dispatch(createNotebook(payload)),
    deleteNotebook: (id: string) => dispatch(deleteNotebook(id)),
  };
}

export const useNotebookId = () => {
  const { notebook } = useSelector(notebookSelector);
  return notebook?.id;
};
