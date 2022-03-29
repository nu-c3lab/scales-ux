import { createSlice } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "store";
import { authSelector } from "store/auth";
import { notebookSelector } from "store/notebook";
import { notify } from "reapop";
import { ringSelector } from "store/rings";
import appendQuery from "append-query";
import dayjs from "dayjs";
import { useSelector, useDispatch } from "react-redux";
import { authorizationHeader } from "utils";
import config from "config";

const initialStateAnalysisItem: IPanelAnalysisItem = {
  id: "",
  statements: [],
  results: [],
};

const PanelInitialState = {
  loadingPanelResults: false,
  collapsed: true,
  resultsCollapsed: true,
  updatingPanel: false,
  hasErrors: false,
  analysis: [],
};
interface InitialState {
  loadingPanels: boolean;
  creatingPanel: boolean;
  deletingPanel: boolean;
  hasErrors: boolean;
  panels: Array<IPanel>;
}

export const initialState: InitialState = {
  loadingPanels: true,
  creatingPanel: false,
  deletingPanel: false,
  hasErrors: false,
  panels: [],
};

const panelsSlice = createSlice({
  name: "panels",
  initialState,
  reducers: {
    getPanels: (state) => ({
      ...state,
      loadingPanels: true,
    }),
    getPanelsSuccess: (state, { payload }) => {
      return {
        ...state,
        loadingPanels: false,
        hasErrors: false,
        panels: payload
          .map((panel) => ({
            ...PanelInitialState,
            ...state.panels.find((p) => p.id == panel.id),
            ...panel,
          }))
          .reverse(),
      };
    },
    getPanelsFailure: (state) => ({
      ...state,
      loadingPanels: false,
      hasErrors: true,
    }),
    createPanel: (state) => ({
      ...state,
      creatingPanel: true,
    }),
    createPanelSuccess: (state, { payload }) => ({
      ...state,
      panels: [...state.panels, { ...PanelInitialState, ...payload }],
      creatingPanel: false,
      hasErrors: false,
    }),
    createPanelFailure: (state) => ({
      ...state,
      creatingPanel: false,
      hasErrors: true,
    }),
    updatePanel: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, updatingPanel: true }
          : panel,
      ),
    }),
    updatePanelSuccess: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.id
          ? { ...panel, ...payload, updatingPanel: false }
          : panel,
      ),
      hasErrors: false,
    }),
    updatePanelFailure: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, updatingPanel: false, hasErrors: true }
          : panel,
      ),
    }),
    deletePanel: (state) => ({
      ...state,
      panels: state.panels.map((panel) => ({
        ...panel,
        deletingPanel: true,
      })),
    }),
    deletePanelSuccess: (state, { payload }) => ({
      ...state,
      panels: state.panels.filter((panel) => panel.id !== payload),
      deletingPanel: false,
      hasErrors: false,
    }),
    deletePanelFailure: (state) => ({
      ...state,
      panels: state.panels.map((panel) => ({
        ...panel,
        deletingPanel: false,
        hasErrors: true,
      })),
      deletingPanel: false,
      hasErrors: true,
    }),
    getPanelResults: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, loadingPanelResults: true }
          : panel,
      ),
    }),
    getPanelResultsSuccess: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? {
            ...panel,
            results: payload.results,
            loadingPanelResults: false,
            hasErrors: false,
          }
          : panel,
      ),
    }),
    getPanelResultsFailure: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? {
            ...panel,
            loadingPanelResults: false,
            hasErrors: true,
          }
          : panel,
      ),
    }),
    setPanelFilters: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, filters: payload.filters }
          : panel,
      ),
    }),
    clearPanelFilters: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId ? { ...panel, filters: [] } : panel,
      ),
    }),
    clearPanel: (state, { payload }) => ({
      ...state,
      panels: state.panels.filter((panel) => panel.id !== payload),
    }),
    clearPanels: (state) => ({
      ...state,
      panels: [],
      loadingPanels: false,
    }),
    setPanelCollapsed: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, collapsed: payload.collapsed }
          : panel,
      ),
    }),
    setPanelResultsCollapsed: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, resultsCollapsed: payload.collapsed }
          : panel,
      ),
    }),
    setPanelDescription: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? { ...panel, description: payload.description }
          : panel,
      ),
    }),
    addPanelAnalysis: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? {
            ...panel,
            analysis: [
              ...panel.analysis,
              { ...initialStateAnalysisItem, ...payload.analysis },
            ],
          }
          : panel,
      ),
    }),
    removePanelAnalysis: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? {
            ...panel,
            analysis: panel.analysis.filter(
              (analysis) => analysis.id !== payload.analysisId,
            ),
          }
          : panel,
      ),
    }),
    addPanelAnalysisStatement: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? {
            ...panel,
            analysis: panel.analysis.map((analysis) =>
              analysis.id === payload.analysisId
                ? {
                  ...analysis,
                  statements: [...analysis.statements, payload.statement],
                }
                : analysis,
            ),
          }
          : panel,
      ),
    }),
    removePanelAnalysisStatement: (state, { payload }) => ({
      ...state,
      panels: state.panels.map((panel) =>
        panel.id === payload.panelId
          ? {
            ...panel,
            analysis: panel.analysis.map((analysis) =>
              analysis.id === payload.analysisId
                ? {
                  ...analysis,
                  statements: analysis.statements.filter(
                    (statement) => statement.id !== payload.statementId,
                  ),
                }
                : analysis,
            ),
          }
          : panel,
      ),
    }),
  },
});

// Three actions generated from the slice
export const panelsActions = panelsSlice.actions;

// Selectors
export const panelsSelector = (state: RootState, notebookId) => ({
  ...state.panels,
  panels: state.panels.panels.filter((panel) => panel.notebookId == notebookId),
});
export const panelSelector = (state: RootState, panelId: string) => {
  return state?.panels?.panels?.find((panel) => panel.id === panelId);
};
export const panelFiltersSelector = (state: RootState, panelId: string) => {
  return state?.panels?.panels?.find((panel) => panel.id === panelId)?.filters;
};
export const panelResultsSelector = (state: RootState, panelId: string) => {
  return state?.panels?.panels.find((panel) => panel.id === panelId)?.results;
};
export const panelAnalysisSelector = (state: RootState, panelId: string) => {
  return state?.panels?.panels.find((panel) => panel.id === panelId)?.analysis;
};

// The reducer
export default panelsSlice.reducer;

// Thunk Async Actions
export const getPanels = (notebookId) => {
  return async (dispatch: AppDispatch, getState) => {
    try {
      const { token } = authSelector(getState());
      const authHeader = authorizationHeader(token);
      dispatch(panelsActions.getPanels());

      const response = await fetch(
        `${config.SERVER_API_URL}/notebooks/${notebookId}/panels`,
        {
          method: "GET",
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        },
      );

      const { data, message } = await response.json();
      if (response.status === 200) {
        dispatch(panelsActions.getPanelsSuccess(data.panels));
      } else {
        dispatch(notify(message, "error"));
        dispatch(panelsActions.getPanelsFailure());
      }
    } catch (error) {
      dispatch(panelsActions.getPanelsFailure());
    }
  };
};

export const createPanel =
  (payload: any = {}) =>
    async (dispatch: AppDispatch, getState) => {
      try {
        const { token, user } = authSelector(getState());
        const { notebook } = notebookSelector(getState());
        const authHeader = authorizationHeader(token);
        dispatch(panelsActions.createPanel());

        const response = await fetch(
          `${config.SERVER_API_URL}/panels`,
          {
            method: "POST",
            headers: {
              ...authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...payload,
              notebookId: notebook.id,
              userId: user.id,
            }),
          },
        );

        const { data, message } = await response.json();
        if (response.status === 200) {
          dispatch(notify(message, "success"));
          dispatch(panelsActions.createPanelSuccess(data.panel));
        } else {
          dispatch(notify(message, "error"));
          dispatch(panelsActions.createPanelFailure());
        }
      } catch (error) {
        dispatch(panelsActions.createPanelFailure());
      }
    };

export const updatePanel =
  (panelId, payload: any = {}) =>
    async (dispatch: AppDispatch, getState) => {
      try {
        const { token } = authSelector(getState());
        const authHeader = authorizationHeader(token);
        dispatch(panelsActions.updatePanel({ panelId }));

        const response = await fetch(
          `${config.SERVER_API_URL}/panels/${panelId}`,
          {
            method: "PUT",
            headers: {
              ...authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const { data, message } = await response.json();
        if (response.status === 200) {
          dispatch(notify(message, "success"));
          dispatch(panelsActions.updatePanelSuccess(data.panel));
        } else {
          dispatch(notify(message, "error"));
          dispatch(panelsActions.updatePanelFailure({ panelId }));
        }
      } catch (error) {
        dispatch(panelsActions.updatePanelFailure({ panelId }));
      }
    };

export const deletePanel =
  (panelId) => async (dispatch: AppDispatch, getState) => {
    try {
      const { token } = authSelector(getState());
      const authHeader = authorizationHeader(token);
      dispatch(panelsActions.deletePanel());

      const response = await fetch(
        `${config.SERVER_API_URL}/panels/${panelId}`,
        {
          method: "DELETE",
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        },
      );

      const { data, message } = await response.json();
      if (response.status === 200) {
        dispatch(notify(message, "success"));
        dispatch(panelsActions.deletePanelSuccess(panelId));
      } else {
        dispatch(notify(message, "error"));
        dispatch(panelsActions.deletePanelFailure());
      }
    } catch (error) {
      dispatch(panelsActions.deletePanelFailure());
    }
  };

export const getPanelResults =
  (panelId, filters = [], page = 0, batchSize = 10) =>
    async (dispatch: AppDispatch, getState) => {
      try {
        const { token } = authSelector(getState());
        const authHeader = authorizationHeader(token);
        const panel = panelSelector(getState(), panelId);
        const { filters, ringId } = panel;
        // @ts-ignore
        const { rid, info, version } = ringSelector(getState(), ringId);
        dispatch(panelsActions.getPanelResults({ panelId }));

        const response = await fetch(
          appendQuery(
            `${config.SERVER_PROXY_URL}/results/${rid}/${version}/${info.defaultEntity}?page=${page}&batchSize=${batchSize}&sortBy=dateFiled&sortDirection=desc`,
            filters?.reduce((acc, filterInput: FilterInput) => {
              acc[filterInput.type] =
                filterInput.type === "dateFiled"
                  ? `[${filterInput.value?.map((date) =>
                    dayjs(date).format("YYYY-M-DD"),
                  )}]`
                  : filterInput.value;

              return acc;
            }, {}),
            { encodeComponents: false },
          ),
        );
        const data = await response.json();
        console.log(data);
        if (response.status === 200) {
          dispatch(
            panelsActions.getPanelResultsSuccess({
              panelId,
              results: data,
            }),
          );
        } else {
          dispatch(notify("Error fetching results", "error"));
          dispatch(panelsActions.getPanelResultsFailure({ panelId }));
        }
      } catch (error) {
        console.log(error);
        dispatch(notify("Error fetching results", "error"));
        dispatch(panelsActions.getPanelResultsFailure({ panelId }));
      }
    };

// Hooks
export const usePanels = (notebookId) => {
  const { panels, loadingPanels, hasErrors, creatingPanel, deletingPanel } =
    useSelector((state: RootState) => ({
      ...state.panels,
      ...panelsSelector(state, notebookId),
    }));
  const dispatch = useDispatch();

  return {
    panelsActions,
    panels,
    loadingPanels,
    hasErrors,
    creatingPanel,
    deletingPanel,
    updatePanel: (panelId, payload) => dispatch(updatePanel(panelId, payload)),
    getPanels: (notebookId) => dispatch(getPanels(notebookId)),
    createPanel: (payload: any = {}) => dispatch(createPanel(payload)),
    deletePanel: (panelId) => dispatch(deletePanel(panelId)),
  };
};

export const usePanel = (panelId: string) => {
  const panel = useSelector((state: RootState) =>
    panelSelector(state, panelId),
  );
  const results = useSelector((state: RootState) =>
    panelResultsSelector(state, panelId),
  );
  const filters = useSelector((state: RootState) =>
    panelFiltersSelector(state, panelId),
  );
  const analysis = useSelector((state: RootState) =>
    panelAnalysisSelector(state, panelId),
  );

  const {
    loadingPanelResults,
    resultsCollapsed,
    collapsed,
    updatingPanel,
    hasErrors,
  } = panel;
  const dispatch = useDispatch();

  return {
    panel,
    results,
    filters,
    loadingPanelResults,
    resultsCollapsed,
    collapsed,
    updatingPanel,
    hasErrors,
    analysis,
    addPanelAnalysis: (analysis) =>
      dispatch(panelsActions.addPanelAnalysis({ panelId, analysis })),
    removePanelAnalysis: (id) =>
      dispatch(panelsActions.removePanelAnalysis({ panelId, analysisId: id })),
    addPanelAnalysisStatement: (payload) =>
      dispatch(panelsActions.addPanelAnalysisStatement(payload)),
    removePanelAnalysisStatement: (payload) =>
      dispatch(panelsActions.removePanelAnalysisStatement(payload)),
    setPanelDescription: (description) =>
      dispatch(panelsActions.setPanelDescription({ panelId, description })),
    setPanelCollapsed: (collapsed: boolean) =>
      dispatch(panelsActions.setPanelCollapsed({ panelId, collapsed })),
    setPanelResultsCollapsed: (collapsed: boolean) =>
      dispatch(panelsActions.setPanelResultsCollapsed({ panelId, collapsed })),
    setPanelFilters: (filters: any = {}) => {
      dispatch(panelsActions.setPanelFilters({ panelId, filters }));
    },
    updatePanel: (payload: any = {}) => dispatch(updatePanel(panelId, payload)),
    deletePanel: () => dispatch(deletePanel(panelId)),
    getPanelResults: (filters = [], page = 0, batchSize = 10) =>
      dispatch(getPanelResults(panelId, filters, page, batchSize)),
  };
};
