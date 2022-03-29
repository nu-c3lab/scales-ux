import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "store";
import { authSelector } from "store/auth";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "reapop";
import { authorizationHeader } from "utils";
import config from "config";

interface InitialState {
  loadingRings: boolean;
  loadingRingInfo: boolean;
  hasErrors: boolean;
  rings: Array<IRing>;
}

export const initialState: InitialState = {
  loadingRings: false,
  loadingRingInfo: false,
  hasErrors: false,
  rings: null,
};

// A slice for rings with our three reducers
const ringsSlice = createSlice({
  name: "rings",
  initialState,
  reducers: {
    getRings: (state) => ({
      ...state,
      loadingRings: true,
    }),
    getRingsSuccess: (state, { payload }) => ({
      ...state,
      rings: payload,
      loadingRings: false,
      hasErrors: false,
    }),
    getRingsFailure: (state) => ({
      ...state,
      loadingRings: false,
      hasErrors: true,
    }),
    getRingInfo: (state) => ({
      ...state,
      loadingRingInfo: true,
    }),
    getRingInfoSuccess: (state, { payload }) => ({
      ...state,
      rings: state.rings.map((ring) =>
        ring.rid == payload.rid ? { ...ring, info: payload.info } : ring,
      ),
      loadingRingInfo: false,
      hasErrors: false,
    }),
    getRingInfoFailure: (state) => ({
      ...state,
      loadingRingInfo: false,
      hasErrors: true,
    }),
  },
});

// Three actions generated from the slice
export const ringsActions = ringsSlice.actions;

// Selectors
export const ringsSelector = (state: RootState) => state?.rings;
export const ringSelector = (state: RootState, id: string) =>
  state?.rings?.rings?.find((ring) => ring.id === id);
export const ringInfoSelector = (state: RootState, id: string) =>
  state?.rings?.rings?.find((ring) => ring.id === id)?.info;

// The reducer
export default ringsSlice.reducer;

// Async actions
export const getRings = () => {
  return async (dispatch: AppDispatch, getState) => {
    try {
      const { token } = authSelector(getState());
      const authHeader = authorizationHeader(token);
      dispatch(ringsActions.getRings());

      const response = await fetch(
        `${config.SERVER_API_URL}/rings`,
        {
          headers: {
            ...authHeader,
          },
        },
      );
      const { data } = await response.json();

      if (response.status === 200) {
        dispatch(ringsActions.getRingsSuccess(data.rings));
      } else {
        dispatch(ringsActions.getRingsFailure());
      }
    } catch (error) {
      console.log(error);
      dispatch(ringsActions.getRingsFailure());
    }
  };
};

export const getRingInfo = (rid: string, version: number) => {
  return async (dispatch: AppDispatch) => {
    const failedToGetRingInfoNotification = () =>
      dispatch(notify("Failed to get ring info!", "error"));

    try {
      dispatch(ringsActions.getRingInfo());
      const response = await fetch(
        `${config.SERVER_PROXY_URL}/rings/${rid}/${version}`,
      );
      const info = await response.json();

      if (response.status === 200) {
        dispatch(ringsActions.getRingInfoSuccess({ rid, info }));
      } else {
        failedToGetRingInfoNotification();
        dispatch(ringsActions.getRingInfoFailure());
      }
    } catch (error) {
      failedToGetRingInfoNotification();
      dispatch(ringsActions.getRingInfoFailure());
    }
  };
};

// Hooks
export const useRings = () => {
  const { rings, loadingRings, hasErrors, loadingRingInfo } =
    useSelector(ringsSelector);
  const dispatch = useDispatch();

  return {
    ringsActions,
    rings,
    loadingRings,
    loadingRingInfo,
    hasErrors,
    getRings: () => dispatch(getRings()),
    getRingInfo: (rid: string, version: number) =>
      dispatch(getRingInfo(rid, version)),
  };
};

export const useRing = (id) => {
  const ring = useSelector((state: RootState) => ringSelector(state, id));
  const info = useSelector((state: RootState) => ringInfoSelector(state, id));
  const { loadingRingInfo } = useSelector(ringsSelector);
  const dispatch = useDispatch();

  return {
    ring,
    info,
    loadingRingInfo,
    getRingInfo: (version: number) => dispatch(getRingInfo(ring.rid, version)),
  };
};
