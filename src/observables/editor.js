import { v4 as uuidv4 } from "uuid";
import { Observable } from "lib";
import store$ from "./store";

const historyReducer = (state, action) => {
  switch (action.type) {
    case "UNDO": {
      if (state.past.length === 0) return state;
      return {
        past: state.past.slice(1),
        current: state.past[0],
        future: [state.current, ...state.future],
      };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      return {
        past: [state.current, ...state.past],
        current: state.future[0],
        future: state.future.slice(1),
      };
    }
    case "UPDATE": {
      return {
        past: [state.current, ...state.past],
        current: action.payload,
        future: [],
      };
    }
    case "RESET": {
      return {
        past: [],
        current: action.payload,
        futrue: [],
      };
    }
    default:
      return state;
  }
};

const editor$ = Observable({
  id: null,
  recipientEmail: "",
  subject: "",
  history$: Observable({
    state: {
      past: [],
      current: "",
      future: [],
    },
    dispatch(action) {
      this.state = historyReducer(this.state, action);
    },
  }),
  get content() {
    return this.history$.state.current;
  },
  get message() {
    return {
      id: this.id,
      recipientEmail: this.recipientEmail,
      senderEmail: "test@example.com",
      senderName: "Me",
      subject: this.subject,
      content: this.content,
    };
  },

  undo() {
    this.history$.dispatch({ type: "UNDO" });
  },
  redo() {
    this.history$.dispatch({ type: "REDO" });
  },
  updateHistory(content) {
    this.history$.dispatch({ type: "UPDATE", payload: content });
  },
  resetHistory(content) {
    this.history$.dispatch({ type: "RESET", payload: content });
  },

  createDraft() {
    this.id = uuidv4();
    this.recipientEmail = "";
    this.subject = "";
    this.resetHistory("");
  },
  replaceDraft(draft) {
    this.saveDraft();
    this.id = draft.id;
    this.recipientEmai = draft.recipientEmail;
    this.subject = draft.subject;
    this.resetHistory(draft.content);
  },
  saveDraft() {
    store$.dispatch((dispatch) => {
      setTimeout(() => {
        dispatch({
          type: store$.T.SAVE_DRAFT,
          payload: this.message,
        });
      }, 200);
    });
  },
  send() {
    store$.dispatch((dispatch) => {
      setTimeout(() => {
        dispatch({
          type: store$.T.SEND,
          payload: this.message,
        });
      }, 200);
    });
  },
});

export default editor$;
