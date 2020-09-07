import $router from "@observables/router";
import AppBar from "@components/AppBar/AppBar";
import Sidebar from "@components/Sidebar/Sidebar";
import DragImage from "@components/DragImage/DragImage";
import { Container } from "./App.decor";

const Mailbox = lazy(() => import("@components/Mailbox/Mailbox"));
const Detail = lazy(() => import("@components/Detail/Detail"));
const Editor = lazy(() => import("@components/Editor/Editor"));
// import Editor from "@components/Editor/Editor";

const init = () => ({
  $sidebar: observable({
    collapsed: false,
    hovered: false,
  }),
});

const App = (__, { $sidebar }) =>
  // use-transform
  Container([
    AppBar((toggle = () => ($sidebar.collapsed = !$sidebar.collapsed))),
    Sidebar(($sidebar = $sidebar)),
    $router.id ? Detail() : Mailbox(),
    Editor(),
    DragImage((key = "drag-image")),
  ]);

App.init = init;

export default App;
