import _ from "lodash";
import store$ from "../observables/store";
import router$ from "../observables/router";
import editor$ from "../observables/editor";
import selection$ from "../observables/selection";
import { Observable, withState } from "lib";
import MailItem from "./MailItem";
import DragImage from "./DragImage";

const OFFSET = 15;

const initialState = () => ({
  dragState$: Observable({
    isDragging: false,
    x: 0,
    y: 0,
  }),
  timer: {
    current: null,
  },
});

const MailList = ({ folder, mails }, { dragState$, timer, editorPopup$ }) => {
  const setCoordinates = _.throttle((x, y) => {
    dragState$.x = x;
    dragState$.y = y;
  }, 32);

  const setIsDragging = (isDragging) => {
    dragState$.isDragging = isDragging;
  };

  const dragListeners = {
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
  };

  return (
    // use-transform
    [
      DragImage((key = "drag-image"), (dragState$ = dragState$)),
      ...mails.map((mail, index) =>
        MailItem(
          (key = index),
          (mail = mail),
          (folder = folder),
          (selected = selection$.selected.has(mail.id)),
          (toggleItem = () => {
            selection$.set(mail.id, !selection$.selected.has(mail.id));
          }),
          (onmousedown = () => {
            timer.current = setTimeout(() => {
              selection$.set(mail.id, true);
              timer.current = null;
            }, 300);
          }),
          (onmouseup = () => {
            if (timer.current) {
              clearTimeout(timer.current);
              timer.current = null;
              if (folder === "drafts") {
                editor$.replaceDraft(mail);
                editorPopup$.open = true;
              } else {
                router$.navigate(`/${folder}/${mail.id}`);
              }
            }
          }),
          (deleteItem = () => {
            store$.dispatch((dispatch) => {
              setTimeout(() => {
                dispatch({
                  type: store.T.DELETE,
                  payload: { folder, id: mail.id },
                });
              }, 200);
            });
          }),
          (dragListeners = dragListeners)
        )
      ),
    ]
  );
};

export default withState(initialState)(MailList);
