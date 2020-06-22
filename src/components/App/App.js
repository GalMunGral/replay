import $router from "@observables/router";
import $selection from "@observables/selection";
import $store from "@observables/store";
import $editor from "@observables/editor";

import AppBar from "@components/AppBar/AppBar";
import Mailbox from "@components/Mailbox/Mailbox";
import Sidebar from "@components/Sidebar/Sidebar";
import Editor from "@components/Editor/Editor";
import Detail from "@components/Detail/Detail";

import { Container } from "./App.decor";

const context = () => {
  return {
    $router,
    $store,
    $selection,
    $editor,
    $editorPopup: observable({
      open: false,
      minimized: false,
    }),
    $sidebar: observable({
      collapsed: false,
    }),
  };
};

const App = (__, { $router }) => {
  const { folder, id } = $router;
  return (
    // use-transform
    Container([
      AppBar(),
      Sidebar(),
      id ? Detail({ folder, id }) : Mailbox({ folder }),
      Editor(),
    ])
  );
};

App.context = context;

export default App;
