import throttle from "lodash/throttle";
import { Router, decorator as $$ } from "replay-next/utils";
import store from "../store";
import AppBar from "./AppBar";
import DragImage from "./DragImage";
import Debug from "./Debug";
import Mailbox from "./Mailbox";
import Detail from "./Detail";
import Editor from "./Editor";

const folderExists = ({ folder }) =>
  ["inbox", "sent", "drafts", "trash"].includes(folder);

const router = new Router([
  { path: "/:folder", validate: folderExists, component: Mailbox },
  { path: "/:folder/:id", validate: folderExists, component: Detail },
  { path: "/*", component: Debug },
]);

const RouterView = router.RouterView;

const App = () => (
  <Container>
    <AppBar />
    <RouterView />
    <Editor />
    <DragImage key="drag-image" />
  </Container>
);

App.init = () => ({
  store,
  sidebar: {
    collapsed: false,
    hovered: false,
    toggle() {
      this.collapsed = !this.collapsed;
    },
  },
  dragState: {
    isDragging: false,
    x: 0,
    y: 0,
    setCoordinates: throttle(function (x, y) {
      this.x = x;
      this.y = y;
    }, 40),
  },
});

export default App;

const Container = $$.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template:
    "a a" 64px
    "b c" calc(100vh - 60px) / auto 1fr;
`;
