import { Container, ToolbarContainer, Scrollable } from "./LayoutComponents";

const Layout = () => (_, [buttons, body]) => {
  return (
    // use-transform
    // prettier-ignore
    Container([
      ToolbarContainer([
        buttons
      ]),
      Scrollable([
        body
      ])
    ])
  );
};

export default Layout;
