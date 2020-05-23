import { Container, ToolbarContainer, Scrollable } from "../elements/Layout";

const Layout = ({ children: [buttons, body] }) =>
  // use-transform
  // prettier-ignore
  Container([
    ToolbarContainer([buttons]),
    Scrollable([body])
  ]);

export default Layout;
