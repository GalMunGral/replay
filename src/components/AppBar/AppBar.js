import {
  Container,
  Group,
  MenuButton,
  MenuIcon,
  AppLogo,
  SearchBar,
  SearchIcon,
  SearchInput,
} from "./AppBar.decor";

const AppBar = ({ toggleSidebar }) =>
  // use-transform
  Container([
    Group([
      MenuButton((onclick = toggleSidebar), [
        MenuIcon((className = "fas fa-bars")),
      ]),
      AppLogo((src = "/assets/images/logo.png"), (alt = "logo")),
    ]),
    SearchBar([
      SearchIcon((className = "fas fa-search")),
      SearchInput((placeholder = "Search mail")),
    ]),
    Group(),
  ]);

export default AppBar;
