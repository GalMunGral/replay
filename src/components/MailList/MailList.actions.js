const createActions = (context) => {
  const {
    timer,
    $editorPopup,
    $store,
    $editor,
    $route,
    $router,
    $selection,
  } = context;

  const { folder } = $route;
  const { selected } = $selection;

  const toggleItem = (id) => {
    $selection.set(id, !selected.includes(id));
  };

  const deleteItem = (id) => {
    $store.dispatch((dispatch) => {
      setTimeout(() => {
        dispatch({
          type: $store.T.DELETE,
          payload: { folder, id },
        });
      }, 200);
    });
  };

  const selectAfter = (mail, delay) => {
    timer.current = setTimeout(() => {
      $selection.set(mail.id, true);
      timer.current = null;
    }, delay);
  };

  const cancelSelectAndOpen = (mail) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      if (folder === "drafts") {
        $editor.replaceDraft(mail);
        $editorPopup.minimized = false;
        $editorPopup.open = true;
      } else {
        $router.navigate(`/${folder}/${mail.id}`);
      }
    }
  };

  return {
    toggleItem,
    deleteItem,
    selectAfter,
    cancelSelectAndOpen,
  };
};

export default createActions;
