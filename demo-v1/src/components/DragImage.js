import { Box, Icon } from "./DragImageComponents";

const DragImage = (_, context) => () => {
  const selected = context.selection.getSelected();
  const [dragging, x, y] = context.getDragState();

  return (
    // use-transform
    // prettier-ignore
    Box(
      style={
        visibility: dragging ? "visible" : "hidden",
        transform: `translate3d(${x}px, ${y}px, 0)`,
      }, [
        Icon(className="fas fa-mail-bulk"),
        span(`Move ${selected.length} ${selected.length > 1 ? "items" : "item"}`),
      ]
    )
  );
};

export default DragImage;
