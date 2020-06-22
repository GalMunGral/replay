import { Box, Icon } from "./DragImage.decor";

const DragImage = (__, context) => {
  const {
    $selection: { selected },
    $dragState: { isDragging, x, y },
  } = context;

  const style = {
    visibility: isDragging ? "visible" : "hidden",
    transform: `translate3d(${x}px, ${y}px, 0)`,
  };

  return (
    // use-transform
    Box((style = style), [
      Icon((className = "fas fa-mail-bulk")),
      span(`Move ${selected.length} ${selected.length > 1 ? "items" : "item"}`),
    ])
  );
};

export default DragImage;
