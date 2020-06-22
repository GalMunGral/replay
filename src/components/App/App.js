import AppBar from "@components/AppBar/AppBar";
import Mailbox from "@components/Mailbox/Mailbox";
import Sidebar from "@components/Sidebar/Sidebar";
import Editor from "@components/Editor/Editor";
import Detail from "@components/Detail/Detail";
import { Container } from "./App.decor";

import $router from "@observables/router";
import $store from "@observables/store";
import $selection from "@observables/selection";
import $editor from "@observables/editor";

const init = () => {
  const globals = {
    $router,
    $store,
    $selection,
    $editor,
  };

  return {
    $editorPopup: observable({
      open: false,
      minimized: false,
    }),
    $sidebar: observable({
      collapsed: false,
      hovered: false,
    }),
    ...globals,
  };
};

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
    }
  };

  return (
    // use-transform
    Container([
      AppBar((toggleSidebar = toggleSidebar)),
      Sidebar(($sidebar = $sidebar), (openEditor = openEditor)),
      id ? Detail((folder = folder), (id = id)) : Mailbox((folder = folder)),
      Editor(($editorPopup = $editorPopup)),
    ])
  );
};

App.init = init;

export default App;
