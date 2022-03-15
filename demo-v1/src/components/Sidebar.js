import {
  Menu,
  EditorButton,
  EditorButtonIcon,
  EditorButtonText,
  MenuItem,
  MenuIcon,
} from "./SidebarComponents";

const iconMap = {
  inbox: "inbox",
  sent: "paper-plane",
  drafts: "scroll",
};

const Sidebar = (state, context) => {
  const { getFolder, navigate } = context.route;
  const { dispatch, Type: T } = context.store;
  const { getSelected, setSelected } = context.selection;
  const { getEditing, createDraft, open } = context.editor;

  state.hovered = false;
  state.dropZoneActive = false;

  return ({ collapsed }) => {
    const folder = getFolder();
    const selected = getSelected();
    const editing = getEditing();

    const deleteAll = () => {
      dispatch((d) => {
        setTimeout(() => {
          d({
            type: T.DELETE_SELECTED,
            payload: { folder, selected },
          });
          setSelected([]);
        }, 200);
      });
    };

    return (
      // use-transform
      // prettier-ignore
      Menu(
        collapsed=(collapsed && !state.hovered),
        onmouseenter=() => { state.hovered = true },
        onmouseleave=() => { state.hovered = false },
        [
          EditorButton(
            collapsed=(collapsed && !state.hovered),
            onclick=() => {
              if (!editing) {
                createDraft();
                open();
              }
            },
            [
              EditorButtonIcon(src="/assets/images/create.png"),
              !collapsed || state.hovered
                ? EditorButtonText("Compose") 
                : null,
            ]
          ),
          ...["inbox", "sent", "drafts"].map((folder) =>
            MenuItem(
              collapsed=(collapsed && !state.hovered),
              activated=(getFolder() === folder),
              onclick=() => navigate("/" + folder),
              [
                MenuIcon(className=`fas fa-${iconMap[folder]}`),
                !collapsed || state.hovered
                  ? span(folder)
                  : null,
              ]
            )
          ),
          MenuItem(
            collapsed=(collapsed && !state.hovered),
            activated=(getFolder() === "trash"),
            style={
              background: state.dropZoneActive ? "var(--theme)" : "",
              color: state.dropZoneActive ? "white" : "",
            },
            onclick=() => navigate("/trash"),
            ondragenter=(e) => {
              e.preventDefault();
              e.stopPropagation();
              state.dropZoneActive = true;
            },
            ondragover=(e) => {
              e.preventDefault();
              e.stopPropagation();
            },
            ondragleave=() => {
              state.dropZoneActive = false;
            },
            ondrop=() => {
              deleteAll();
              state.dropZoneActive = false;
            },
            [
              MenuIcon(className="fas fa-trash"),
              !collapsed || state.hovered 
                ? span("trash") 
                : null,
            ]
          ),
        ]
      )
    );
  };
};

export default Sidebar;
