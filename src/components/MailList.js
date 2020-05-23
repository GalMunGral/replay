import _ from "lodash";
import { Observable, withContext } from "lib";
import MailItem from "./MailItem";
import DragImage from "./DragImage";

const OFFSET = 15;

const context = () => {
  const dragState$ = Observable({
    isDragging: false,
    x: 0,
    y: 0,
    setCoordinates: _.throttle((x, y) => {
      dragState$.x = x;
      dragState$.y = y;
    }, 32),
    setIsDragging: (isDragging) => {
      dragState$.isDragging = isDragging;
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
    route$: { folder },
    mails$: { currentPage },
    editorPopup$,
    store$,
    selection$,
    selection$: { selected },
    router$,
    editor$,
  }
) =>
  // use-transform
  [
    ...currentPage.map((mail, index) =>
      MailItem({
        key: index,
        mail,
        folder,
        selected: selected.has(mail.id),
        toggleItem: () => {
          selection$.set(mail.id, !selected.has(mail.id));
        },
        deleteItem: () => {
          store$.dispatch((dispatch) => {
            setTimeout(() => {
              dispatch({
                type: store.T.DELETE,
                payload: { folder, id: mail.id },
              });
            }, 200);
          });
        },
        eventListeners: {
          ondrag: (e) => {
            setCoordinates(e.clientX - OFFSET, e.clientY - OFFSET);
          },
          ondragstart: (e) => {
            e.dataTransfer.setDragImage(new Image(), 0, 0);
            setTimeout(() => {
              setIsDragging(true);
            }, 100);
          },
          ondragend: () => {
            setIsDragging(false);
          },
          onmousedown: () => {
            timer.current = setTimeout(() => {
              selection$.set(mail.id, true);
              timer.current = null;
            }, 300);
          },
          onmouseup: () => {
            if (timer.current) {
              clearTimeout(timer.current);
              timer.current = null;
              if (folder === "drafts") {
                editor$.replaceDraft(mail);
                editorPopup$.minimized = false;
                editorPopup$.open = true;
              } else {
                router$.navigate(`/${folder}/${mail.id}`);
              }
            }
          },
        },
      })
    ),
    DragImage((key = "drag-image")),
  ];

export default withContext(context)(MailList);
