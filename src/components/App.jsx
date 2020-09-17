import { throttle } from "lodash";
import { lazy } from "replay/core";
import { observer, observable, Router, decorator as $$ } from "replay/utils";
import store from "../observables/store";
import AppBar from "./AppBar";
import DragImage from "./DragImage";
import Debug from "./Debug";

const Mailbox = lazy(() => import("./Mailbox"));
const Detail = lazy(() => import("./Detail"));
const Editor = lazy(() => import("./Editor"));

const folderExists = ({ folder }) =>
  ["inbox", "sent", "drafts", "trash"].includes(folder);

const App = observer(() => [
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
    <Editor />
    <DragImage key="drag-image" />
  </Container>,
]);

App.init = () => ({
  store,
  sidebar: observable({
    collapsed: false,
    hovered: false,
    toggle() {
      this.collapsed = !this.collapsed;
    },
  }),
  dragState: observable({
    isDragging: false,
    x: 0,
    y: 0,
    setCoordinates: throttle(function (x, y) {
      this.x = x;
      this.y = y;
    }, 33.33),
  }),
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
