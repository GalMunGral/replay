const selected = Symbol("selected");

const useSelection = (state) => {
  state[selected] = state[selected] || [];
  const getSelected = () => state[selected];
  const setSelected = (v) => (state[selected] = v);

  return { getSelected, setSelected };
};

export default useSelection;
