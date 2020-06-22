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
        [folder]: [...state[folder], ...data],
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
        sent: [message, ...state.sent],
      };
    }
    default:
      return state;
  }
};

const $store = observable({
  T: Type,
  state: {
    inbox: [],
    sent: [],
    drafts: [],
    trash: [],
  },
  dispatch(action) {
    if (typeof action === "function") {
      const dispatch = this.dispatch.bind(this);
      action(dispatch);
    } else {
      this.state = reducer(this.state, action);
    }
  },
  getMail(folder, id) {
    return this.state[folder].find((item) => item.id === id);
  },
  getMails(folder, tab) {
    return folder === "inbox"
      ? this.state[folder].filter((it) => it.category === tab)
      : this.state[folder];
  },
});

fetch("/data.json")
  .then((res) => res.json())
  .then((data) => {
    $store.dispatch({
      type: $store.T.LOAD,
      payload: { folder: "inbox", data },
    });
  });

export default $store;
