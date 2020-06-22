import { Container, ToolbarContainer, Scrollable } from "./Layout.decor";

const Layout = ({ children: [toolbar, body] }) =>
  // use-transform
  Container([
    // prettier-ignore
    ToolbarContainer([toolbar]),
    Scrollable([body]),
  ]);

export default Layout;
