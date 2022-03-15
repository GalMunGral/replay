import _ from "lodash";
import useItemSelection from "../hooks/itemSelection";
import Checkbox from "./Checkbox";
import IconButton from "./IconButton";
import {
  Container,
  SenderInfo,
  Summary,
  Title,
  Preheader,
  Actions,
} from "./MailItemComponents";

const format = (length) => (s) =>
  s.length <= length ? s : s.slice(0, length) + "...";

const MailItem = (state, context) => {
  const { dispatch, Type: T } = context.store;
  const { replaceDraft, setEditing } = context.editor;
  const { getFolder, setMailId } = context.route;
  const { setSelected, toggleItem } = useItemSelection(context.selection);

  const OFFSET = 15;
  let setCoordinatesThrottled;
  let timer;

  return ({ selected, item, setCoordinates, setDragging }) => {
    const { id, senderName, senderEmail, subject, content } = item;
    const folder = getFolder();

    const deleteItem = () => {
      dispatch((d) => {
        setTimeout(() => {
          d({
            type: T.DELETE,
            payload: {
              folder,
              id,
            },
          });
        }, 200);
      });
    };

    setCoordinatesThrottled =
      setCoordinatesThrottled ||
      _.throttle((x, y) => {
        setCoordinates(x, y);
      }, 32);

    const ondrag = (e) =>
      setCoordinatesThrottled(e.clientX - OFFSET, e.clientY - OFFSET);
    const ondragstart = (e) => {
      e.dataTransfer.setDragImage(new Image(), 0, 0);
      setTimeout(() => {
        setDragging(true);
      }, 100);
    };
    const ondragend = () => {
      setDragging(false);
      setSelected([]);
    };

    const onmousedown = () => {
      timer = setTimeout(() => {
        toggleItem(item, true);
        timer = null;
      }, 300);
    };

    const onmouseup = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
        if (folder === "drafts") {
          replaceDraft(item);
          setEditing(true);
        } else {
          setSelected([]);
          setMailId(item.id);
        }
      }
    };

    return (
      // use-transform
      // prettier-ignore
      Container(
        selected=selected,
        draggable=(folder !== "trash"),
        ondragstart=ondragstart,
        ondrag=ondrag,
        ondragend=ondragend,
        onmousedown=onmousedown,
        onmouseup=onmouseup,
        [
          folder !== "trash"
            ? Checkbox(
                checked=selected,
                onchange=() => toggleItem(item, !selected)
              )
            : null,
          SenderInfo(senderName || senderEmail || "(no name)"),
          Summary([
            Title(format(30)(subject) || "(empty)"),
            Preheader(
              innerHTML = `&nbsp;&mdash;&nbsp;${
                format(50)(content) || "(empty)"
              }`
            ),
          ]),
          folder !== "trash"
            ? Actions([
                IconButton(
                  type="trash",
                  onclick=deleteItem,
                  onmousedown=(e) => e.stopPropagation(),
                  onmouseup=(e) => e.stopPropagation()
                ),
              ])
            : null,
        ]
      )
    );
  };
};

export default MailItem;
