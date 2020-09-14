import { Link, decorator as $$ } from "replay/utils";
import appLogoImage from "../assets/images/logo.png";

const AppBar = ({ toggle }) => [
  <Container>
    <Group>
      <MenuButton onclick={toggle}>
        <MenuIcon className="fas fa-bars" />
      </MenuButton>
      <Link to="/inbox">
        <AppLogo src={appLogoImage} alt="logo" />
      </Link>
    </Group>
    <SearchBar>
      <SearchIcon className="fas fa-search" />
      <SearchInput placeholder="Search mail" />
    </SearchBar>
    <Group />
  </Container>,
];

export default AppBar;

const Container = $$.div`
  grid-area: a;
  padding: 2px 10px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--light-gray);
`;

const Group = $$.div`
  flex: 0 0 auto;
  min-width: 200px;
  height: 100%;
  display: flex;
  align-items: center;
`;

const MenuButton = $$.button`
  --size: 48px;
  border: none;
  width: var(--size);
  height: var(--size);
  border-radius: calc(0.5 * var(--size));
  margin: 5px;
  background: none;
  outline: none;
  cursor: pointer;\

`.$`:hover {
    background: var(--light-gray);
  }
`;

const AppLogo = $$.img`
  height: 40px;
`;

const MenuIcon = $$.i`
  font-size: 1rem;
  color: var(--dark-gray);
`;

const SearchInput = $$.input`
  height: 100%;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 1rem;
`;

const SearchBar = $$.div`
  width: 50vw;
  height: calc(100% - 20px);
  padding: 5px;
  background: var(--light-gray);
  border-radius: 10px;
  transition: all 0.2s;
  display: flex;
  align-items: center;

`.$`:focus-within {
    box-shadow: 0 1px 4px 0px var(--gray);
    background: white;
  }
`;

const SearchIcon = $$.i`
  font-size: 1rem;
  color: var(--dark-gray);
  margin: 20px;
`;
