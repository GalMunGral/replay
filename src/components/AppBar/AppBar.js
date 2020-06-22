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

const AppBar = (__, { $sidebar }) =>
  // use-transform
  Container([
    Group([
      MenuButton((onclick = () => ($sidebar.collapsed = !$sidebar.collapsed)), [
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
