import { Observable } from "replay/utils";

const historyReducer = (state, action) => {
  switch (action.type) {
    case "UNDO":
      if (state.past.length === 0) return state;
      return {
        past: state.past.slice(1),
        current: state.past[0],
        future: [state.current, ...state.future],
      };
    case "REDO":
      if (state.future.length === 0) return state;
      return {
        past: [state.current, ...state.past],
        current: state.future[0],
        future: state.future.slice(1),
      };
    case "UPDATE":
      return {
        past: [state.current, ...state.past],
        current: action.payload,
        future: [],
      };
    case "RESET":
      return {
        past: [],
        current: action.payload,
        futrue: [],
      };
    default:
      return state;
  }
};

const $history = new Observable({
  state: {
    past: [],
    current: "",
    future: [],
  },
  dispatch(action) {
    this.state = historyReducer(this.state, action);
  },
});

export default $history;
