import { withContext, Observable } from "lib";
import {
  Menu,
  EditorButton,
  EditorButtonIcon,
  EditorButtonText,
  MenuItem,
  MenuIcon,
} from "../elements/Sidebar";

const folders = ["inbox", "sent", "drafts"];
const iconMap = {
  inbox: "inbox",
  sent: "paper-plane",
  drafts: "scroll",
};

const context = () => ({
  self$: Observable({
    hovered: false,
    canDrop: false,
  }),
});

const Sidebar = (
  __,
  {
    self$,
    editorPopup$,
    sidebar$,
    store$,
    editor$,
    router$,
    router$: { folder },
  }
) => {
  const collapsed = sidebar$.collapsed && !self$.hovered;

  const deleteAll = () => {
    store$.dispatch((dispatch) => {
      setTimeout(() => {
        dispatch({
          type: store$.T.DELETE_SELECTED,
          payload: {
            folder,
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
      (onmouseenter = () => (self$.hovered = true)),
      (onmouseleave = () => (self$.hovered = false)),
      [
        EditorButton(
          { collapsed },
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
        ...folders.map((_folder) =>
          MenuItem(
            { collapsed },
            (activated = folder === _folder),
            (onclick = () => router$.navigate("/" + _folder)),
            [
              MenuIcon((className = `fas fa-${iconMap[_folder]}`)),
              !collapsed && span(_folder),
            ]
          )
        ),
        MenuItem(
          { collapsed },
          (activated = folder === "trash"),
          (style = {
            background: self$.canDrop ? "var(--theme)" : "",
            color: self$.canDrop ? "white" : "",
          }),
          (onclick = () => router$.navigate("/trash")),
          (ondragenter = (e) => {
            e.preventDefault();
            e.stopPropagation();
            self$.canDrop = true;
          }),
          (ondragover = (e) => {
            e.preventDefault();
            e.stopPropagation();
          }),
          (ondragleave = () => {
            self$.canDrop = false;
          }),
          (ondrop = () => {
            deleteAll();
            self$.canDrop = false;
          }),
          [MenuIcon((className = "fas fa-trash")), !collapsed && span("trash")]
        ),
      ]
    )
  );
};

export default withContext(context)(Sidebar);
