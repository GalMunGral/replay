import {
  Container,
  Group,
  MenuButton,
  MenuIcon,
  AppLogo,
  SearchBar,
  SearchIcon,
  SearchInput,
} from "../elements/AppBar";

const AppBar = (__, { sideBar$ }) =>
  // use-transform
  Container([
    Group([
      MenuButton((onclick = () => (sideBar$.collapsed = !sideBar$.collapsed)), [
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
