import useReducer from "./reducer";

const initialState = {
  past: [],
  current: "",
  future: [],
};

const reducer = (state, action) => {
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
        ...initialState,
        current: action.payload,
      };
    }
    default:
      return state;
  }
};

const useEditorHistory = (state) => {
  const { getState, dispatch } = useReducer(state, reducer, initialState);

  const undo = () => dispatch({ type: "UNDO" });
  const redo = () => dispatch({ type: "REDO" });

  const getContent = () => getState().current;

  const updateHistory = (e) =>
    dispatch({ type: "UPDATE", payload: e.target.value });

  const resetHistory = (content) =>
    dispatch({ type: "RESET", payload: content });

  return { undo, redo, getContent, updateHistory, resetHistory };
};

export default useEditorHistory;
