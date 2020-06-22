import _ from "lodash";

import MailItem from "@components/MailItem/MailItem";
import DragImage from "@components/DragImage/DragImage";

const OFFSET = 15;

const context = () => {
  const dragState$ = observable({
    isDragging: false,
    x: 0,
    y: 0,

    setCoordinates: _.throttle((x, y) => {
      dragState$.x = x;
      dragState$.y = y;
    }, 32),

    setIsDragging: (bool) => {
      dragState$.isDragging = bool;
    },
  });

  return {
    dragState$,
    timer: {
      current: null,
    },
  };
};

const MailList = (
  __,
  {
    timer,
    dragState$: { setCoordinates, setIsDragging },
    $route: { folder },
    $mails: { currentPage },
    $store,
    $editor,
    $editorPopup,
    $router,
    $selection,
    $selection: { selected },
  }
) => {
  const toggleItem = (id) => {
    $selection.set(id, !selected.has(id));
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

  const ondrag = (e) => {
    setCoordinates(e.clientX - OFFSET, e.clientY - OFFSET);
  };
  const ondragstart = (e) => {
    e.dataTransfer.setDragImage(new Image(), 0, 0);
    setTimeout(() => {
      setIsDragging(true);
    }, 100);
  };

  const ondragend = () => {
    setIsDragging(false);
  };

  return (
    // use-transform
    [
      ...currentPage.map((mail, index) =>
        MailItem({
          key: index,
          mail,
          folder,
          selected: selected.has(mail.id),
          toggleItem: () => toggleItem(mail.id),
          deleteItem: () => deleteItem(mail.id),
          eventListeners: {
            ondrag,
            ondragstart,
            ondragend,
            onmousedown: () => selectAfter(mail, 300),
            onmouseup: () => cancelSelectAndOpen(mail),
          },
        })
      ),
      DragImage((key = "drag-image")),
    ]
  );
};

MailList.context = context;

export default MailList;
