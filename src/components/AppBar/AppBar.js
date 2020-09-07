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
import appLogoImage from "@assets/images/logo.png";

const AppBar = ({ toggle }) =>
  // use-transform
  Container([
    Group([
      MenuButton((onclick = toggle), [MenuIcon((className = "fas fa-bars"))]),
      AppLogo((src = appLogoImage), (alt = "logo")),
    ]),
    SearchBar([
      SearchIcon((className = "fas fa-search")),
      SearchInput((placeholder = "Search mail")),
    ]),
    Group(),
  ]);

export default AppBar;
