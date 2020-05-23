import { Container, ToolbarContainer, Scrollable } from "../elements/Layout";

const Layout = ({ children: [toolbar, body] }) =>
  // use-transform
  // prettier-ignore
  Container([
    ToolbarContainer([toolbar]),
    Scrollable([body])
  ]);

export default Layout;
