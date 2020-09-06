import MailItem from "@components/MailItem/MailItem";
import DragImage from "@components/DragImage/DragImage";
import createActions from "./MailList.actions";

const OFFSET = 30;
const DELAY = 1000 / 60;

const init = () => {
  const state = {
    $dragState: observable({
      isDragging: false,
      x: 0,
      y: 0,
      setIsDragging: (isDragging) => {
        state.$dragState.isDragging = isDragging;
      },
      setCoordinates: _.throttle((x, y) => {
        state.$dragState.x = x;
        state.$dragState.y = y;
      }, DELAY),
    }),
    timer: {
      current: null,
    },
  };
  return state;
};

const MailList = (__, context) => {
  const { $dragState, $mails, $router, $selection } = context;
  const { setCoordinates, setIsDragging } = $dragState;
  const { folder } = $router;

  const actions = createActions(context);

  const dragHandlers = {
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
      ...$mails.currentPage.map((mail) =>
        MailItem(
          (key = mail.id),
          (mail = mail),
          (folder = folder),
          (selected = $selection.selected.includes(mail.id)),
          (toggleItem = () => actions.toggleItem(mail.id)),
          (deleteItem = () => actions.deleteItem(mail.id)),
          (selectItem = () => actions.selectAfter(mail, 300)),
          (viewItem = () => actions.cancelSelectAndOpen(mail)),
          (dragHandlers = dragHandlers)
        )
      ),
      DragImage((key = "drag-image")),
    ]
  );
};

MailList.init = init;

export default MailList;
