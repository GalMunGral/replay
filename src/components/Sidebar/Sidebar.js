import $editor from "@observables/editor";
import $router from "@observables/router";
import SidebarDropZone from "@components/SidebarDropZone/SidebarDropZone";
import {
  Menu,
  EditorButton,
  EditorButtonIcon,
  EditorButtonText,
  MenuItem,
  MenuIcon,
} from "./Sidebar.decor";
import editorButtonIconImage from "@assets/images/create.png";

const iconMap = {
  inbox: "inbox",
  sent: "paper-plane",
  drafts: "scroll",
};

const Sidebar = ({ $sidebar }) => {
  const collapsed = $sidebar.collapsed && !$sidebar.hovered;
  return (
    // use-transform
    Menu(
      (collapsed = collapsed),
      (onmouseenter = () => ($sidebar.hovered = true)),
      (onmouseleave = () => ($sidebar.hovered = false)),
      [
        EditorButton(
          (collapsed = collapsed),
          (onclick = () => $editor.openEditor()),
          [
            EditorButtonIcon((src = editorButtonIconImage)),
            !collapsed && EditorButtonText("Compose"),
          ]
        ),
        ...["inbox", "sent", "drafts"].map((f) =>
          MenuItem(
            (collapsed = collapsed),
            (activated = $router.folder === f),
            (onclick = () => $router.navigate("/" + f)),
            [
              MenuIcon((className = `fas fa-${iconMap[f]}`)),
              !collapsed && span(f),
            ]
          )
        ),
        SidebarDropZone((collapsed = collapsed)),
      ]
    )
  );
};

export default Sidebar;
