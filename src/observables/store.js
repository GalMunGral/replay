import _ from "lodash";
import { Observable } from "lib";

const Type = {
  LOAD: "LOAD",
  DELETE: "DELETE",
  SAVE_DRAFT: "SAVE_DRAFT",
  SEND: "SEND",
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

const store$ = Observable({
  state: {
    inbox: [],
    sent: [],
    drafts: [],
    trash: [],
  },
  T: Type,
  dispatch(action) {
    if (typeof action === "function") {
      action(this.dispatch.bind(this));
    } else {
      // console.log(action);
      this.state = reducer(this.state, action);
      // console.log(this.state);
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
    store$.dispatch({
      type: store$.T.LOAD,
      payload: {
        folder: "inbox",
        data,
      },
    });
  });

export default store$;
