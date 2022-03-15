import { Link, prevent, decorator as $$ } from "replay/utils";

const iconMap = {
  inbox: "inbox",
  sent: "paper-plane",
  drafts: "scroll",
};

const SidebarMenu = ({ hidden }, scope) => {
  const {
    links,
    dropzoneActivated,
    dropzoneStyle,
    ondragenter,
    ondragleave,
    ondrop,
  } = scope;

  return [
    links.forEach(({ url, name, activated, className }) => (
      <Link to={url}>
        {(linkProps) => (
          <MenuItem {...linkProps} hidden={hidden} activated={activated}>
            <MenuIcon className={className} />
            {!hidden ? <span>{name}</span> : <comment />}
          </MenuItem>
        )}
      </Link>
    )),
    <Link to="/trash">
      {(linkProps) => (
        <MenuItem
          {...linkProps}
          hidden={hidden}
          style={dropzoneStyle}
          activated={dropzoneActivated}
          ondragenter={ondragenter}
          ondragover={prevent()} // to make it a valid drop target
          ondragleave={ondragleave}
          ondrop={ondrop}
        >
          <MenuIcon className="fas fa-trash" />
          {!hidden ? <span>trash</span> : <comment />}
        </MenuItem>
      )}
    </Link>,
  ];
};

SidebarMenu.init = ({}, $this) => ({
  folders: ["inbox", "sent", "drafts"],
  canDrop: false,
  get links() {
    return this.folders.map((folder) => ({
      name: folder,
      url: "/" + folder,
      activated: $this.route.params.folder === folder,
      className: `fas fa-${iconMap[folder]}`,
    }));
  },
  get dropzoneActivated() {
    return $this.route.params.folder === "trash";
  },
  get dropzoneStyle() {
    return {
      background: $this.canDrop ? "var(--theme)" : "",
      color: $this.canDrop ? "white" : "",
    };
  },
  ondragenter() {
    $this.canDrop = true;
  },
  ondragleave() {
    $this.canDrop = false;
  },
  ondrop() {
    const folder = $this.route.params.folder;
    const selected = $this.store.state.selection.current;
    $this.store.dispatch((dispatch) => {
      setTimeout(() => {
        dispatch("mails/deleteSelected", {
          folder,
          selected,
        });
        dispatch("selection/reset");
      }, 200);
    });
    $this.canDrop = false;
  },
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
}`;
