import { Observer, Link, decorator as $$ } from "replay/utils";
import $editor from "../observables/editor";
import editorButtonIconImage from "../assets/images/create.png";
import Dropzone from "./Dropzone";
import { MenuItem, MenuIcon } from "./Menu";

const iconMap = {
  inbox: "inbox",
  sent: "paper-plane",
  drafts: "scroll",
};

const Sidebar = Observer((__, { $sidebar, $route }) => {
  const { collapsed, hovered } = $sidebar;
  const hidden = collapsed && !hovered;
  return [
    <Menu
      hidden={hidden}
      onmouseenter={() => ($sidebar.hovered = true)}
      onmouseleave={() => ($sidebar.hovered = false)}
    >
      <EditorButton hidden={hidden} onclick={() => $editor.openEditor()}>
        <ButtonIcon src={editorButtonIconImage} />
        {!hidden && <ButtonText>Compose</ButtonText>}
      </EditorButton>
      {...["inbox", "sent", "drafts"].map((folder) => (
        <Link to={"/" + folder}>
          <MenuItem hidden={hidden} activated={$route.params.folder === folder}>
            <MenuIcon className={`fas fa-${iconMap[folder]}`} />
            {!hidden && <span>{folder}</span>}
          </MenuItem>
        </Link>
      ))}
      <Dropzone hidden={hidden} />
    </Menu>,
  ];
});

export default Sidebar;

const Menu = $$.div`
  grid-area: b;
  overflow: auto;
  transition: width 0.05s ease-out;
  background: white;
  overflow: hidden;
  width: ${({ hidden }) => (hidden ? 72 : 250)}px;
  display: flex;
  flex-direction: column;
  align-items: ${({ hidden }) => (hidden ? "center" : "start")};
`;

const EditorButton = $$.button`
  --size: 50px;
  width: ${({ hidden }) => (hidden ? "var(--size)" : "150px")};
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

const ButtonIcon = $$.img`
  --size: 32px;
  width: var(--size);
  height: var(--size);
`;

const ButtonText = $$.span`
  margin-left: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--dark-gray);
`;
