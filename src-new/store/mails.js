import { createStore } from "replay-next/utils";

const mails = createStore({
  initialState: {
    inbox: [],
    sent: [],
    drafts: [],
    trash: [],
  },
  reducer(state, action) {
    switch (action.type) {
      case "load": {
        const { folder, data } = action.payload;
        return {
          ...state,
          [folder]: data,
        };
      }
      case "delete": {
        const { id, folder } = action.payload;
        const item = state[folder].find((item) => item.id === id);
        return item
          ? {
              ...state,
              [folder]: state[folder].filter((item) => item.id !== id),
              trash: [item, ...state.trash],
            }
          : state;
      }
      case "saveDraft": {
        return {
          ...state,
          drafts: [
            action.payload,
            ...state.drafts.filter((item) => item.id !== action.payload.id),
          ],
        };
      }
      case "deleteSelected": {
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
      case "send": {
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
  },
});

export default mails;
