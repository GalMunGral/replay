import { observer, decorator as $$ } from "replay/utils";

const DragImage = observer((__, { store, dragState }) => {
  const { isDragging, x, y } = dragState;
  const selected = store.state.selection.current;

  return [
    <Box
      style={{
        visibility: isDragging ? "visible" : "hidden",
        transform: `translate3d(${x}px, ${y}px, 0)`,
      }}
    >
      <Icon className="fas fa-mail-bulk" />
      <span>{`Move ${selected.length} ${
        selected.length > 1 ? "items" : "item"
      }`}</span>
    </Box>,
  ];
});

export default DragImage;

const Box = $$.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 220px;
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: white;
  font-weight: bold;
  background: var(--blue);
  border-radius: 5px;
  box-shadow: 0 1px 15px 0 gray;
  pointer-events: none;
  z-index: 999;
`;

const Icon = $$.i`
  margin-right: 15px;
`;
