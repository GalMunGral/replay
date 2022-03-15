import useStoreAsync from "../hooks/store";
import useSelection from "../hooks/selection";
import usePagination from "../hooks/pagination";
import useEditor from "../hooks/editor";
import useRoute from "../hooks/route";
import AppBar from "./AppBar";
import Mailbox from "./Mailbox";
import Sidebar from "./Sidebar";
import Editor from "./Editor";
import Detail from "./Detail";
import { Container } from "./AppComponents";

const App = (state, context) => {
  context.store = useStoreAsync(context);
  context.editor = useEditor(context, context.store);
  context.route = useRoute(context);
  context.selection = useSelection(context);
  context.pagination = usePagination(context, 50, {
    store: context.store,
    route: context.route,
    selection: context.selection,
  });

  state.collapsed = false;

  return () => {
    const mailId = context.route.getMailId();
    const editing = context.editor.getEditing();

    return (
      // use-transform
      // prettier-ignore
      Container([
        AppBar(toggle=() => { state.collapsed = !state.collapsed }),
        Sidebar(
          collapsed=state.collapsed,
          setCollapse=(v) => state.setCollapse(v)
        ),
        mailId ? Detail(mailId=mailId) : Mailbox(),
        editing ? Editor() : null,
      ])
    );
  };
};

export default App;
