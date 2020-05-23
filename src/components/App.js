import { withState, Observable } from "lib";
import router$ from "../observables/router";
import AppBar from "./AppBar";
import Mailbox from "./Mailbox";
import Sidebar from "./Sidebar";
import Editor from "./Editor";
import Detail from "./Detail";
import { Container } from "../elements/App";

const initialState = () => ({
  editorPopup$: Observable({
    open: false,
  }),
  sideBar$: Observable({
    collapsed: false,
  }),
});

const App = (__, { sideBar$, editorPopup$ }) => {
  const { folder, id } = router$;
  return (
    // use-transform
    Container([
      AppBar({ toggle: () => (sideBar$.collapsed = !sideBar$.collapsed) }),
      Sidebar({ folder }),
      id ? Detail({ folder, id }) : Mailbox({ folder }),
      editorPopup$.open ? Editor() : null,
    ])
  );
};

export default withState(initialState)(App);
