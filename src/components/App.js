import { withContext, Observable } from "lib";
import router$ from "../observables/router";
import selection$ from "../observables/selection";
import store$ from "../observables/store";
import editor$ from "../observables/editor";
import AppBar from "./AppBar";
import Mailbox from "./Mailbox";
import Sidebar from "./Sidebar";
import Editor from "./Editor";
import Detail from "./Detail";
import { Container } from "../elements/App";

const context = () => ({
  router$,
  store$,
  selection$,
  editor$,
  editorPopup$: Observable({
    open: false,
    minimized: false,
  }),
  sideBar$: Observable({
    collapsed: false,
  }),
});

const App = (__, { router$ }) => {
  const { folder, id } = router$;
  return (
    // use-transform
    Container([
      AppBar(),
      Sidebar({ folder }),
      id ? Detail({ folder, id }) : Mailbox({ folder }),
      Editor(),
    ])
  );
};

export default withContext(context)(App);
