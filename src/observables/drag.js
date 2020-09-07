const DELAY = 1000 / 60;

const $dragState = observable({
  isDragging: false,
  x: 0,
  y: 0,
  setIsDragging(isDragging) {
    this.isDragging = isDragging;
  },
  setCoordinates: _.throttle(function (x, y) {
    this.x = x;
    this.y = y;
  }, DELAY),
});

export default $dragState;
