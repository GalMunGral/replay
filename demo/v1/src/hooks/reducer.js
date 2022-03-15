const useReducer = (state, reducer, initialState) => {
  const key = Symbol("[reducer]");
  state[key] = initialState;
  return {
    getState: () => state[key],
    dispatch: (action) => {
      state[key] = reducer(state[key], action);
    },
  };
};

export default useReducer;
