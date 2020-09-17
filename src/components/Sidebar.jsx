import { observer, decorator as $$ } from "replay/utils";
import SidebarMenu from "./SidebarMenu";
import editorButtonIcon from "../assets/images/create.png";

const Sidebar = observer((__, { sidebar, route, store }) => {
  const currentFolder = route.params.folder;
  const { collapsed, hovered } = sidebar;
  const hidden = collapsed && !hovered;
  const openEditor = () => store.dispatch("editor/openEditor");
  const setHovered = (hovered) => () => (sidebar.hovered = hovered);

  return [
    <Container
      hidden={hidden}
      onmouseenter={setHovered(true)}
      onmouseleave={setHovered(false)}
    >
      <EditorButton hidden={hidden} onclick={openEditor}>
        <ButtonIcon src={editorButtonIcon} />
        {!hidden ? <ButtonText>Compose</ButtonText> : null}
      </EditorButton>
      <SidebarMenu hidden={hidden} currentFolder={currentFolder} />
    </Container>,
  ];
});

export default Sidebar;

const Container = $$.div`
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
