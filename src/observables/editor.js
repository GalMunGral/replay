import { v4 as uuidv4 } from "uuid";
import $store from "@observables/store";
import $history from "@observables/history";

const $editor = observable({
  id: "",
  recipientEmail: "",
  subject: "",
  get content() {
    return $history.state.current;
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
    $history.dispatch({ type: "UNDO" });
  },
  redo() {
    $history.dispatch({ type: "REDO" });
  },
  updateHistory(content) {
    $history.dispatch({ type: "UPDATE", payload: content });
  },
  resetHistory(content) {
    $history.dispatch({ type: "RESET", payload: content });
  },
  createDraft() {
    this.id = uuidv4();
    this.recipientEmail = "";
    this.subject = "";
    this.resetHistory("");
  },
  saveDraft() {
    $store.dispatch((dispatch) => {
      setTimeout(() => {
        dispatch({
          type: $store.T.SAVE_DRAFT,
          payload: this.message,
        });
      }, 200);
    });
  },
  replaceDraft(draft) {
    this.saveDraft();
    this.id = draft.id;
    this.recipientEmai = draft.recipientEmail;
    this.subject = draft.subject;
    this.resetHistory(draft.content);
  },
  sendMail() {
    $store.dispatch((dispatch) => {
      setTimeout(() => {
        dispatch({
          type: $store.T.SEND,
          payload: this.message,
        });
      }, 200);
    });
  },
});

export default $editor;
