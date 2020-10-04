import { v4 as uuidv4 } from "uuid/dist/esm-browser/index.js";
import { createStore } from "replay-next/utils";
import mails from "./mails";

const content = createStore({
  initialState: { value: "" },
  reducer(state, action) {
    switch (action.type) {
      case "update":
        return { value: action.payload };
      default:
        return state;
    }
  },
});

const editor = createStore({
  modules: { content },
  mutableState: {
    id: null,
    recipientEmail: null,
    subject: null,
    open: false,
    minimized: false,
    get message() {
      return {
        id: this.id,
        recipientEmail: this.recipientEmail,
        senderEmail: "hewenqi@gatech.edu",
        senderName: "Wenqi He",
        subject: this.subject,
        content: content.state.value,
      };
    },
    createDraft() {
      this.id = uuidv4();
      this.recipientEmail = "";
      this.subject = "";
      content.dispatch("reset", { value: "" });
    },
    saveDraft() {
      this.open = false;
      const message = this.message;
      mails.dispatch((dispatch) => {
        setTimeout(() => {
          dispatch("saveDraft", message);
        }, 200);
      });
      content.dispatch("reset", { value: null });
    },
    sendMail() {
      this.open = false;
      const message = this.message;
      mails.dispatch((dispatch) => {
        setTimeout(() => {
          dispatch("send", message);
        }, 200);
      });
      content.dispatch("reset", { value: null });
    },
    editDraft(draft) {
      this.saveDraft();
      this.id = draft.id;
      this.recipientEmail = draft.recipientEmail;
      this.subject = draft.subject;
      content.dispatch("reset", { value: draft.content });
      this.minimized = false;
      this.open = true;
    },
    openEditor() {
      if (!this.open) {
        this.createDraft();
        this.open = true;
        this.minimized = false;
      }
    },
  },
});

export default editor;
