import { withContext, Observable } from "lib";
import SidebarDropZone from "./SidebarDropZone";
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
  }),
});

const Sidebar = (
  __,
  { self$, editorPopup$, sidebar$, editor$, router$, router$: { folder } }
) => {
  const collapsed = sidebar$.collapsed && !self$.hovered;

  return (
    // use-transform
    Menu(
      { collapsed },
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
        ...folders.map((fldr) =>
          MenuItem(
            { collapsed },
            (activated = folder === fldr),
            (onclick = () => router$.navigate("/" + fldr)),
            [
              MenuIcon((className = `fas fa-${iconMap[fldr]}`)),
              !collapsed && span(fldr),
            ]
          )
        ),
        SidebarDropZone({ collapsed, activated: folder === "trash" }),
      ]
    )
  );
};

export default withContext(context)(Sidebar);
