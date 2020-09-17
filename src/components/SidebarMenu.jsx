import {
  observable,
  observer,
  Link,
  prevent,
  stop,
  decorator as $$,
} from "replay/utils";

const iconMap = {
  inbox: "inbox",
  sent: "paper-plane",
  drafts: "scroll",
};

const SidebarMenu = observer(({ hidden, currentFolder }, { dropzone }) => {
  const activated = currentFolder === "trash";
  const style = {
    background: dropzone.canDrop ? "var(--theme)" : "",
    color: dropzone.canDrop ? "white" : "",
  };
  const eventListeners = {
    ondragenter: stop(prevent(dropzone.ondragenter.bind(dropzone))),
    ondragleave: stop(prevent(dropzone.ondragleave.bind(dropzone))),
    ondragover: stop(prevent()),
    ondrop: stop(prevent(dropzone.ondrop.bind(dropzone))),
  };
  return [
    ...["inbox", "sent", "drafts"].map((folder) => (
      <Link to={"/" + folder}>
        <MenuItem hidden={hidden} activated={folder === currentFolder}>
          <MenuIcon className={`fas fa-${iconMap[folder]}`} />
          {!hidden ? <span>{folder}</span> : null}
        </MenuItem>
      </Link>
    )),
    <Link to="/trash">
      <MenuItem
        hidden={hidden}
        style={style}
        activated={activated}
        {...eventListeners}
      >
        <MenuIcon className="fas fa-trash" />
        {!hidden ? <span>trash</span> : null}
      </MenuItem>
    </Link>,
  ];
});

SidebarMenu.init = ({ currentFolder }, { store }) => ({
  dropzone: observable({
    canDrop: false,
    ondragenter() {
      this.canDrop = true;
    },
    ondragleave() {
      this.canDrop = false;
    },
    ondrop() {
      store.dispatch((dispatch) => {
        setTimeout(() => {
          dispatch("mails/deleteSelected", {
            folder: currentFolder,
            selected: store.state.selection.current,
          });
          dispatch("selection/reset");
        }, 200);
      });
      this.canDrop = false;
    },
  }),
});

export default SidebarMenu;

const MenuIcon = $$.i`
  width: 1rem;
  font-size: 1rem;
`;

const MenuItem = $$.div`
  --size: 35px;
  height: var(--size);
  min-height: var(--size);
  line-height: 1rem;
  width: ${({ hidden }) => (hidden ? "var(--size)" : "80%")};
  padding: 0 ${({ hidden }) => (hidden ? "0" : "10px")};
  margin: 0 ${({ hidden }) => (hidden ? "10px" : "0")};
  display: flex;
  align-items: center;
  justify-content: ${({ hidden }) => (hidden ? "center" : "start")};
  border-top-right-radius: calc(0.5 * var(--size));
  border-bottom-right-radius: calc(0.5 * var(--size));
  border-top-left-radius: ${({ hidden }) =>
    hidden ? "calc(0.5 * var(--size))" : "0"};
  border-bottom-left-radius: ${({ hidden }) =>
    hidden ? "calc(0.5 * var(--size))" : "0"};
  background: white;
  text-decoration: none;
  font-size: 1rem;
  font-weight: ${({ activated }) => (activated ? "700" : "600")};
  color: ${({ activated }) => (activated ? "var(--theme)" : "gray")};
  background: ${({ activated }) =>
    activated ? "var(--theme-light)" : "white"};
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
    margin: 0 ${({ hidden }) => (hidden ? "0" : "20px")};
    color: inherit;
  }
`.$` * {
    pointer-events: none;
  }
`;
