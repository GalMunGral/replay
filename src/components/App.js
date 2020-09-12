const App = Observer((__, { $sidebar }) =>
  //// use transform
  Container([
    AppBar((toggle = () => ($sidebar.collapsed = !$sidebar.collapsed))),
    Sidebar(($sidebar = $sidebar)),
    $router.id ? Detail() : Mailbox(),
    Editor(),
    DragImage((key = "drag-image")),
  ])
);

import { lazy } from "replay/core";
import { Observer, Observable, decorator as $$ } from "replay/utils";
import $router from "@observables/router";
import AppBar from "@components/AppBar";
import Sidebar from "@components/Sidebar";
import DragImage from "@components/DragImage";

const Mailbox = lazy(() => import("@components/Mailbox"));
const Detail = lazy(() => import("@components/Detail"));
const Editor = lazy(() => import("@components/Editor"));

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
