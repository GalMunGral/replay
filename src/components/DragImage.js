import { Box, Icon } from "../elements/DragImage";

const DragImage = (
  __,
  { selection$: { selected }, dragState$: { isDragging, x, y } }
) =>
  // use-transform
  Box(
    (style = {
      visibility: isDragging ? "visible" : "hidden",
      transform: `translate3d(${x}px, ${y}px, 0)`,
    }),
    [
      Icon((className = "fas fa-mail-bulk")),
      span(`Move ${selected.size} ${selected.size > 1 ? "items" : "item"}`),
    ]
  );

export default DragImage;
