import { v4 as uuidv4 } from "uuid";
import useEditorHistory from "./editorHistory";

const id = Symbol("id");
const recipientEmail = Symbol("recipientEmail");
const subject = Symbol("subject");
const editing = Symbol("editing");

const useEditor = (state, store) => {
  const { dispatch, Type: T } = store;
  const {
    undo,
    redo,
    getContent,
    resetHistory,
    updateHistory,
  } = useEditorHistory(state);

  state[id] = state[id] || null;
  state[recipientEmail] = state[id] || "";
  state[subject] = state[id] || "";
  state[editing] = state[id] || false;

  const open = () => (state[editing] = true);
  const close = () => (state[editing] = false);

  const createMessage = () => ({
    id: state[id],
    recipientEmail: state[recipientEmail],
    senderEmail: "test@example.com",
    senderName: "Me",
    subject: state[subject],
    content: getContent(),
  });

  const saveDraft = () => {
    dispatch((d) => {
      setTimeout(() => {
        d({
          type: T.SAVE_DRAFT,
          payload: createMessage(),
        });
      }, 200);
    });
  };

  const send = () => {
    dispatch((d) => {
      setTimeout(() => {
        d({
          type: T.SEND,
          payload: createMessage(),
        });
      }, 200);
    });
  };

  const createDraft = () => {
    state[id] = uuidv4();
    state[recipientEmail] = "";
    state[subject] = "";
    resetHistory("");
  };

  const replaceDraft = (draft) => {
    saveDraft();
    state[id] = draft.id;
    state[recipientEmail] = draft.recipientEmail;
    state[subject] = draft.subject;
    resetHistory(draft.content);
  };

  return {
    getId: () => state[id],
    getRecipientEmail: () => state[recipientEmail],
    setRecipientEmail: (v) => (state[recipientEmail] = v),
    getSubject: () => state[subject],
    setSubject: (v) => (state[subject] = v),
    getEditing: () => state[editing],
    setEditing: (v) => (state[editing] = v),
    undo,
    redo,
    getContent,
    updateHistory,
    saveDraft,
    createDraft,
    replaceDraft,
    send,
    open,
    close,
  };
};

export default useEditor;
