const Sidebar = Observer(({ $sidebar }, { $dropzone }) => {
  const collapsed = $sidebar.collapsed && !$sidebar.hovered;
  return [
    <Menu
      collapsed={collapsed}
      onmouseenter={() => ($sidebar.hovered = true)}
      onmouseleave={() => ($sidebar.hovered = false)}
    >
      <EditorButton collapsed={collapsed} onclick={() => $editor.openEditor()}>
        <EditorButtonIcon src={editorButtonIconImage} />
        {!collapsed && <EditorButtonText>Compose</EditorButtonText>}
      </EditorButton>
      {...["inbox", "sent", "drafts"].map((f) => (
        <MenuItem
          collapsed={collapsed}
          activated={$router.folder === f}
          onclick={() => $router.navigate("/" + f)}
        >
          <MenuIcon className={`fas fa-${iconMap[f]}`} />
          {!collapsed && <span>{f}</span>}
        </MenuItem>
      ))}
      <MenuItem
        collapsed={collapsed}
        activated={$router.folder === "trash"}
        style={{
          background: $dropzone.canDrop ? "var(--theme)" : "",
          color: $dropzone.canDrop ? "white" : "",
        }}
        onclick={$dropzone.onclick.bind($dropzone)}
        ondragenter={$dropzone.ondragenter.bind($dropzone)}
        ondragleave={$dropzone.ondragleave.bind($dropzone)}
        ondragover={$dropzone.ondragover.bind($dropzone)}
        ondrop={$dropzone.ondrop.bind($dropzone)}
      >
        <MenuIcon className="fas fa-trash" /> {!collapsed && <span>trash</span>}
      </MenuItem>
    </Menu>,
  ];
});

import { Observer, Observable, decorator as $$ } from "replay/utils";
import $store from "@observables/store";
import $editor from "@observables/editor";
import $selection from "@observables/selection";
import $router from "@observables/router";
import editorButtonIconImage from "@assets/images/create.png";

const iconMap = {
  inbox: "inbox",
  sent: "paper-plane",
  drafts: "scroll",
};

Sidebar.init = () => ({
  $dropzone: new Observable({
    canDrop: false,
    onclick() {
      $router.navigate("/trash");
    },
    ondragenter(e) {
      e.preventDefault();
      e.stopPropagation();
      this.canDrop = true;
    },
    ondragleave() {
      this.canDrop = false;
    },
    ondragover(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    ondrop() {
      $store.dispatch((dispatch) => {
        setTimeout(() => {
          dispatch({
            type: $store.T.DELETE_SELECTED,
            payload: {
              folder: $router.folder,
              selected: $selection.selected,
            },
          });
          $selection.reset();
        }, 200);
      });
      this.canDrop = false;
    },
  }),
});

export default Sidebar;

const Menu = $$.div`
  grid-area: b;
  overflow: auto;
  transition: width 0.05s ease-out;
  background: white;
  overflow: hidden;
  width: ${({ collapsed }) => (collapsed ? 72 : 250)}px;
  display: flex;
  flex-direction: column;
  align-items: ${({ collapsed }) => (collapsed ? "center" : "start")};
`;

const MenuIcon = $$.i`
  width: 1rem;
  font-size: 1rem;
`;

const EditorButtonIcon = $$.img`
  --size: 32px;
  width: var(--size);
  height: var(--size);
`;

const EditorButton = $$.button`
  --size: 50px;
  width: ${({ collapsed }) => (collapsed ? "var(--size)" : "150px")};
  height: var(--size);
  min-height: var(--size);
  margin: 15px 10px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  outline: none;
  border: none;
  border-radius: calc(0.5 * var(--size));
  box-shadow: 0 1px 3px 1px var(--gray);
  transition: width 0.2s;
  font-family: inherit;
  cursor: pointer;
  transition: box-shadow 0.2s;

`.$`:hover {
    box-shadow: 0 5px 10px 0 var(--gray);
  }
`.$`:active {
    background: var(--light-gray);
  }
`;

const EditorButtonText = $$.span`
  margin-left: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--dark-gray);
`;

const MenuItem = $$.div`
  --size: 35px;
  height: var(--size);
  min-height: var(--size);
  line-height: 1rem;
  width: ${({ collapsed }) => (collapsed ? "var(--size)" : "80%")};
  padding: 0 ${({ collapsed }) => (collapsed ? "0" : "10px")};
  margin: 0 ${({ collapsed }) => (collapsed ? "10px" : "0")};
  display: flex;
  align-items: center;
  justify-content: ${({ collapsed }) => (collapsed ? "center" : "start")};
  border-top-right-radius: calc(0.5 * var(--size));
  border-bottom-right-radius: calc(0.5 * var(--size));
  border-top-left-radius: ${({ collapsed }) =>
    collapsed ? "calc(0.5 * var(--size))" : "0"};
  border-bottom-left-radius: ${({ collapsed }) =>
    collapsed ? "calc(0.5 * var(--size))" : "0"};
  background: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: ${({ activated }) => (activated ? "700" : "600")};
  color: ${({ activated }) => (activated ? "var(--theme)" : "gray")};
  background: ${({ activated }) =>
    activated ? "var(--theme-light)" : "white"};
  cursor: pointer;
  transition: all 0.2s;

`.$`:hover {
    background: ${({ activated }) =>
      activated ? "var(--theme-light)" : "var(--light-gray)"};
  }
`.$`:active {
    background: ${({ activated }) =>
      activated ? "var(--theme-light)" : "var(--gray)"};
  }
`.$` > i {
    margin: 0 ${({ collapsed }) => (collapsed ? "0" : "20px")};
    color: inherit;
  }
`.$` * {
    pointer-events: none;
  }
`;
