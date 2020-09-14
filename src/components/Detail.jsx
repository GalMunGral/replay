import { decorator as $$, Redirect, Fragment, navigate } from "replay/utils";
import $store from "../observables/store";
import Sidebar from "./Sidebar";
import Layout from "./Layout";
import IconButton from "./IconButton";

const Detail = (__, { $route }) => {
  const { folder, id } = $route.params;
  const mail = $store.state[folder].find((m) => m.id === id);
  if (!mail) {
    return [<Redirect to={"/" + $route.params.folder} />];
  }
  const {
    subject,
    senderName = "(no name)",
    senderEmail = "(no email)",
    recipientName = "(no name)",
    recipientEmail = "(no email)",
    content,
  } = mail;
  const senderInfo = `${senderName}&nbsp;&lt;${senderEmail}&gt;`;
  const recipientInfo = `To: ${recipientName}&nbsp;&lt;${recipientEmail}&gt;`;
  const deleteMail = () => {
    $store.dispatch((dispatch) => {
      const { folder, id } = $route.params;
      setTimeout(() => {
        dispatch({
          type: $store.T.DELETE,
          payload: { folder, id },
        });
      }, 200);
      history.back();
    });
  };
  return [
    <Sidebar />,
    <Layout>
      <Fragment>
        <IconButton type="arrow-left" onclick={() => history.back()} />
        {$route.params.folder !== "trash" ? (
          <IconButton type="trash" onclick={deleteMail} />
        ) : null}
      </Fragment>
      <Main>
        <Header>{subject}</Header>
        <SenderInfo innerHTML={senderInfo} />
        <RecipientInfo innerHTML={recipientInfo} />
        <Body>{content}</Body>
      </Main>
    </Layout>,
  ];
};

export default Detail;

const Main = $$.main`
  margin: 0 50px;
`;

const Header = $$.section`
  font-weight: 600;
  font-size: 1.8rem;
  margin: 20px 0;
  text-transform: capitalize;
`;

const SenderInfo = $$.div`
  margin: 0;
  font-weight: bold;
  font-size: 0.9rem;
`;

const RecipientInfo = $$.div`
  margin: 0;
  color: gray;
  font-size: 0.8rem;
`;

const Body = $$.section`
  margin: 20px 0;
  text-align: justify;
`;
