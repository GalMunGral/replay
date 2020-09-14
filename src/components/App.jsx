import { lazy } from "replay/core";
import { Observer, Observable, Router, decorator as $$ } from "replay/utils";
import AppBar from "./AppBar";
import DragImage from "./DragImage";
import Debug from "./Debug";

const Mailbox = lazy(() => import("./Mailbox"));
const Detail = lazy(() => import("./Detail"));
const Editor = lazy(() => import("./Editor"));

const folderExists = ({ folder }) =>
  ["inbox", "sent", "drafts", "trash"].includes(folder);

const App = Observer((__, { $sidebar }) => [
  <Container>
    <AppBar toggle={() => ($sidebar.collapsed = !$sidebar.collapsed)} />
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
  $sidebar: new Observable({
    collapsed: false,
    hovered: false,
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
