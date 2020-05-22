import selection$ from "../observables/selection";
import { Box, Icon } from "../elements/DragImage";

const DragImage = ({ dragState$ }) => {
  const { isDragging, x, y } = dragState$;
  const { selected } = selection$;

  return (
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
    )
  );
};

export default DragImage;
