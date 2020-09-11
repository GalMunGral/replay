import { Observable } from "@replay/core";

const Type = {
  LOAD: "LOAD",
  DELETE: "DELETE",
  SEND: "SEND",
  SAVE_DRAFT: "SAVE_DRAFT",
  DELETE_SELECTED: "DELETE_SELECTED",
};

const reducer = (state, action) => {
  switch (action.type) {
    case Type.LOAD: {
      const { folder, data } = action.payload;
      return {
        ...state,
        [folder]: data,
      };
    }
    case Type.DELETE: {
      const { id, folder } = action.payload;
      const item = state[folder].find((item) => item.id === id);
      return {
        ...state,
        [folder]: state[folder].filter((item) => item.id !== id),
        trash: [item, ...state.trash],
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
    case Type.DELETE_SELECTED: {
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
    }
    case Type.SEND: {
      const message = action.payload;
      return {
        ...state,
        drafts: state.drafts.filter((item) => item.id !== message.id),
        sent: [...state.sent, message],
      };
    }
    default:
      return state;
  }
};

const $store = new Observable({
  T: Type,
  state: {
    inbox: [],
    sent: [],
    drafts: [],
    trash: [],
  },
  dispatch(action) {
    if (typeof action === "function") {
      action(this.dispatch.bind(this));
    } else {
      this.state = reducer(this.state, action);
    }
  },
});

$store.dispatch(async (dispatch) => {
  const res = await fetch("/data.json");
  const data = await res.json();
  dispatch({
    type: $store.T.LOAD,
    payload: { folder: "inbox", data },
  });
});

export default $store;
