import AppBar from "@components/AppBar/AppBar";
import Sidebar from "@components/Sidebar/Sidebar";
import { Container } from "./App.decor";
import $router from "@observables/router";
import $store from "@observables/store";
import $mails from "@observables/mails";
import $selection from "@observables/selection";
import $editor from "@observables/editor";

const Mailbox = lazy(() => import("@components/Mailbox/Mailbox"));
const Detail = lazy(() => import("@components/Detail/Detail"));
const Editor = lazy(() => import("@components/Editor/Editor"));

const init = () => ({
  $router,
  $store,
  $mails,
  $selection,
  $editor,
  $editorPopup: observable({
    open: false,
    minimized: false,
  }),
  $sidebar: observable({
    collapsed: false,
    hovered: false,
  }),
});

const App = (__, context) => {
  const { $editorPopup, $sidebar, $editor, $router } = context;
  const { folder, id } = $router;

  const toggleSidebar = () => {
    $sidebar.collapsed = !$sidebar.collapsed;
  };
  const openEditor = () => {
    if (!$editorPopup.open) {
      $editor.createDraft();
      $editorPopup.open = true;
      $editorPopup.minimized = false;
    }
  };

  return (
    // use-transform
    Container([
      AppBar((toggleSidebar = toggleSidebar)),
      Sidebar(($sidebar = $sidebar), (openEditor = openEditor)),
      // prettier-ignore
      $router.id 
        ? Detail()
        : Mailbox(),
      // prettier-ignore
      $editorPopup.open
        ? Editor(($editorPopup = $editorPopup))
        : null,
    ])
  );
};

App.init = init;

export default App;
