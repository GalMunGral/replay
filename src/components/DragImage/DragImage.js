import $selection from "@observables/selection";
import $dragState from "@observables/drag";
import { Box, Icon } from "@components/DragImage/DragImage.decor";

const DragImage = () => {
  const { selected } = $selection;
  const { isDragging, x, y } = $dragState;
  return (
    // use-transform
    Box(
      (style = {
        visibility: isDragging ? "visible" : "hidden",
        transform: `translate3d(${x}px, ${y}px, 0)`,
      }),
      [
        Icon((className = "fas fa-mail-bulk")),
        span(
          `Move ${selected.length} ${selected.length > 1 ? "items" : "item"}`
        ),
      ]
    )
  );
};

export default DragImage;
