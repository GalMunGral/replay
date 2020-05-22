import { Container, ToolbarContainer, Scrollable } from "../elements/Layout";

const Layout = ({ children: [buttons, body] }) =>
  // use-transform
  Container([ToolbarContainer([buttons]), Scrollable([body])]);

export default Layout;
