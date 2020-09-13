const App = Observer((__, { $sidebar }) => [
  <Container>
    <AppBar toggle={() => ($sidebar.collapsed = !$sidebar.collapsed)} />
    <Sidebar $sidebar={$sidebar} />
    <Mailbox />
    <Router>
      <route path="/:folder">
        <Mailbox />
      </route>
      <route path="/:folder/:id">
        <Detail />
      </route>
    </Router>
    <Editor />
    <DragImage key="drag-image" />
  </Container>,
]);

import { lazy } from "replay/core";
import { Observer, Observable, Router, decorator as $$ } from "replay/utils";
// import $router from "../observables/router";
import AppBar from "./AppBar";
import Sidebar from "./Sidebar";
import DragImage from "./DragImage";

const Mailbox = lazy(() => import("./Mailbox"));
const Detail = lazy(() => import("./Detail"));
const Editor = lazy(() => import("./Editor"));

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
