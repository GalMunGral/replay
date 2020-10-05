import throttle from "lodash/throttle";
import { lazy } from "replay/core";
import { Router, decorator as $$ } from "replay/utils";
import store from "../store";
import AppBar from "./AppBar";
import DragImage from "./DragImage";
import Debug from "./Debug";
import editor from "../store/editor";

const Mailbox = lazy(() => import("./Mailbox"));
const Detail = lazy(() => import("./Detail"));
const Editor = lazy(() => import("./Editor"));

const folderExists = ({ folder }) =>
  ["inbox", "sent", "drafts", "trash"].includes(folder);

const App = ({}, { editor }) => [
  <Container>
    <AppBar />
    <Router>
      <route path="/:folder" validate={folderExists}>
        <Mailbox />
      </route>
      <route path="/:folder/:id" validate={folderExists}>
        <Detail />
      </route>
      <route path="/*">
        <Debug />
      </route>
    </Router>
    {editor.open && <Editor />}
    <DragImage key="drag-image" />
  </Container>,
];

App.init = () => ({
  store,
  get editor() {
    return store.state.editor;
  },
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
