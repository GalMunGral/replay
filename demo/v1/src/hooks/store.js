import useReducer from "./reducer";

const Type = {
  LOAD: "LOAD",
  DELETE: "DELETE",
  SAVE_DRAFT: "SAVE_DRAFT",
  SEND: "SEND",
  DELETE_SELECTED: "DELETE_SELECTED",
};

const initialState = {
  inbox: [],
  sent: [],
  drafts: [],
  trash: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case Type.LOAD: {
      const { folder, data } = action.payload;
      return {
        ...state,
        [folder]: [...state[folder], ...data],
      };
    }
    case Type.DELETE: {
      const { id, folder } = action.payload;
      return {
        ...state,
        [folder]: state[folder].filter((item) => item.id !== id),
        trash: [state[folder].find((item) => item.id === id), ...state.trash],
      };
    }
    case Type.SAVE_DRAFT: {
      return {
        ...state,
        drafts: [
          action.payload,
          ...state.drafts.filter((item) => item.id !== action.payload.id),
        ],
      };
    }
    case Type.DELETE_SELECTED:
      const { folder, selected } = action.payload;
      const selectedSet = new Set(selected);
      return {
        ...state,
        [folder]: state[folder].filter((item) => !selectedSet.has(item.id)),
        trash: [
          ...state[folder].filter((item) => selectedSet.has(item.id)),
          ...state.trash,
        ],
      };
    case Type.SEND:
      const message = action.payload;
      return {
        ...state,
        drafts: state.drafts.filter((item) => item.id !== message.id),
        sent: [message, ...state.sent],
      };
    default:
      return state;
  }
};

const useStore = (state) => {
  const { getState, dispatch } = useReducer(state, reducer, initialState);
  if (typeof fetch == "function") {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => {
        dispatch({
          type: Type.LOAD,
          payload: {
            folder: "inbox",
            data,
          },
        });
      });
  }
  return { getState, dispatch, Type };
};

const useStoreAsync = (state) => {
  const { getState, dispatch, Type } = useStore(state);
  const asyncDispatch = (action) => {
    if (typeof action === "function") {
      action(dispatch);
    } else {
      dispatch(action);
    }
  };
  return { getState, dispatch: asyncDispatch, Type };
};

export default useStoreAsync;
