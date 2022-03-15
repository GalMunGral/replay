const page = Symbol("page");

const usePagination = (state, pageSize, { store, route, selection }) => {
  state[page] = state[page] || 0;

  const { getState: getAllMails } = store;
  const { getFolder, getTab } = route;
  const { getSelected, setSelected } = selection;

  const getPageStart = () => state[page] * pageSize;
  const getPageEnd = () => (state[page] + 1) * pageSize;
  const getTotal = () => {
    const allMails = getAllMails();
    const folder = getFolder();
    const tab = getTab();
    return folder === "inbox" && tab
      ? allMails[folder].filter((item) => item.category === tab).length
      : allMails[folder].length;
  };
  const nextPage = () => {
    const total = getTotal();
    const pageCount = Math.ceil(total / pageSize);
    state[page] = Math.min(state[page] + 1, pageCount - 1);
  };
  const prevPage = () => {
    state[page] = Math.max(state[page] - 1, 0);
  };
  const resetPage = () => {
    state[page] = 0;
  };

  const getPage = () => {
    const allMails = getAllMails();
    const folder = getFolder();
    const tab = getTab();
    const mails =
      folder === "inbox" && tab
        ? allMails[folder].filter((item) => item.category === tab)
        : allMails[folder];
    const start = getPageStart();
    const end = getPageEnd();
    return mails.slice(start, end);
  };

  const allSelected = () => {
    const page = getPage();
    const selected = getSelected();
    return page.length > 0 && page.length === selected.length;
  };

  const toggleAll = () => {
    const page = getPage();
    if (allSelected()) {
      setSelected([]);
    } else {
      setSelected(page.map((item) => item.id));
    }
  };

  return {
    getPageStart,
    getPageEnd,
    getTotal,
    nextPage,
    prevPage,
    resetPage,
    getPage,
    allSelected,
    toggleAll,
  };
};

export default usePagination;
