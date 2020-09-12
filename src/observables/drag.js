import { Observable } from "replay/utils";
import { throttle } from "lodash";

const DELAY = 33.33;

const $dragState = new Observable({
  isDragging: false,
  x: 0,
  y: 0,
  setIsDragging(isDragging) {
    this.isDragging = isDragging;
  },
  setCoordinates: throttle(function (x, y) {
    this.x = x;
    this.y = y;
  }, DELAY),
});

export default $dragState;
