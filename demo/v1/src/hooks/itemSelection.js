const useItemSelection = (selection) => {
  const { getSelected, setSelected } = selection;

  const toggleItem = (item, shouldSelect) => {
    const selected = getSelected();

    if (shouldSelect) {
      if (selected.includes(item.id)) return;
      setSelected([...selected, item.id]);
    } else {
      setSelected(selected.filter((e) => e !== item.id));
    }
  };

  return { getSelected, setSelected, toggleItem };
};

export default useItemSelection;
