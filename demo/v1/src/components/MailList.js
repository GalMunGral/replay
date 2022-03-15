import MailItem from "./MailItem";
import DragImage from "./DragImage";

const x = Symbol("x");
const y = Symbol("y");
const dragging = Symbol("dragging");

const MailList = (_, context) => {
  context[dragging] = false;
  context[x] = 0;
  context[y] = 0;
  context.getDragState = () => [context[dragging], context[x], context[y]];

  return ({ mails }) => {
    const selected = context.selection.getSelected();

    return (
      // use-transform
      // prettier-ignore
      [
        ...mails.map((mail, i) =>
          MailItem(
            key=i, // Reuse these
            item=mail,
            selected=selected.includes(mail.id),
            setCoordinates=(newX, newY) => {
              context[x] = newX;
              context[y] = newY;
            },
            setDragging=(v) => {
              context[dragging] = v;
            }
          )
        ),
        DragImage(),
      ]
    );
  };
};

export default MailList;
