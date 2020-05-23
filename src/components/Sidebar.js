import { withContext, Observable } from "lib";
import router$ from "../observables/router";
import selection$ from "../observables/selection";
import editor$ from "../observables/editor";
import {
  Menu,
  EditorButton,
  EditorButtonIcon,
  EditorButtonText,
  MenuItem,
  MenuIcon,
} from "../elements/Sidebar";

const FOLDERS = ["inbox", "sent", "drafts"];
const ICON_MAP = {
  inbox: "inbox",
  sent: "paper-plane",
  drafts: "scroll",
};

const context = () => ({
  state$: Observable({
    hovered: false,
    canDrop: false,
  }),
});

const Sidebar = ({ folder }, { state$, editorPopup$, sideBar$, store$ }) => {
  const collapsed = sideBar$.collapsed && !state$.hovered;

  const deleteAll = () => {
    store$.dispatch((dispatch) => {
      setTimeout(() => {
        dispatch({
          type: store$.T.DELETE_SELECTED,
          payload: {
            folder: folder,
            selected: selection$.selected,
          },
        });
        selection$.selected = new Set();
      }, 200);
    });
  };

  return (
    // use-transform
    Menu(
      (collapsed = collapsed),
      (onmouseenter = () => (state$.hovered = true)),
      (onmouseleave = () => (state$.hovered = false)),
      [
        EditorButton(
          (collapsed = collapsed),
          (onclick = () => {
            if (!editorPopup$.open) {
              editor$.createDraft();
              editorPopup$.open = true;
            }
          }),
          [
            EditorButtonIcon((src = "/assets/images/create.png")),
            !collapsed && EditorButtonText("Compose"),
          ]
        ),
        ...FOLDERS.map((_folder) =>
          MenuItem(
            (collapsed = collapsed),
            (activated = folder === _folder),
            (onclick = () => router$.navigate("/" + _folder)),
            [
              MenuIcon((className = `fas fa-${ICON_MAP[_folder]}`)),
              !collapsed && span(_folder),
            ]
          )
        ),
        MenuItem(
          { collapsed },
          (activated = folder === "trash"),
          (style = {
            background: state$.canDrop ? "var(--theme)" : "",
            color: state$.canDrop ? "white" : "",
          }),
          (onclick = () => router$.navigate("/trash")),
          (ondragenter = (e) => {
            e.preventDefault();
            e.stopPropagation();
            state$.canDrop = true;
          }),
          (ondragover = (e) => {
            e.preventDefault();
            e.stopPropagation();
          }),
          (ondragleave = () => {
            state$.canDrop = false;
          }),
          (ondrop = () => {
            deleteAll();
            state$.canDrop = false;
          }),
          [MenuIcon((className = "fas fa-trash")), !collapsed && span("trash")]
        ),
      ]
    )
  );
};

export default withContext(context)(Sidebar);
