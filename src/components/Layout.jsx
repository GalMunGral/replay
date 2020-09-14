import { decorator as $$ } from "replay/utils";

const Layout = (props) => [
  <Container>
    <ToolbarContainer>{props.children[0]}</ToolbarContainer>
    <Scrollable>{props.children[1]}</Scrollable>
  </Container>,
];

export default Layout;

const Container = $$.div`
  grid-area: c;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ToolbarContainer = $$.div`
  flex: 0 0 50px;
  border-bottom: 1px solid var(--light-gray);
  display: flex;
  justify-content: start;
  align-items: center;
  padding-left: 10px;
  padding-right: 30px;
`;

const Scrollable = $$.div`
  flex: 1 1 auto;
  overflow-y: auto;
  padding-bottom: 80px;

`.$`::-webkit-scrollbar-thumb {
    background: var(--gray);
  }
`.$`::-webkit-scrollbar {
    width: 10px;
  }
`;
