import { decorator as $$, Redirect, Fragment } from "replay/utils";
import Sidebar from "./Sidebar";
import Layout from "./Layout";
import IconButton from "./IconButton";

const Detail = ({}, scope) => {
  const { redirectUrl, mail, senderInfo, recipientInfo, deleteButton } = scope;
  const { subject, content } = mail;
  return !mail
    ? [<Redirect to={redirectUrl} />]
    : [
        <Sidebar />,
        <Layout>
          <Fragment>
            <IconButton type="arrow-left" onclick={() => history.back()} />
            {deleteButton}
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

Detail.init = ({}, { route, store }) => ({
  get redirectUrl() {
    return "/" + route.params.folder;
  },
  get mail() {
    const { folder, id } = route.params;
    const mail = store.state.mails[folder].find((mail) => mail.id === id);
    return mail;
  },
  get senderInfo() {
    const { senderName = "(no name)", senderEmail = "(no email)" } = this.mail;
    return `${senderName}&nbsp;&lt;${senderEmail}&gt;`;
  },
  get recipientInfo() {
    const {
      recipientName = "(no name)",
      recipientEmail = "(no email)",
    } = this.mail;
    return `To: ${recipientName}&nbsp;&lt;${recipientEmail}&gt;`;
  },
  get deleteButton() {
    const button = <IconButton type="trash" onclick={this.deleteAsync} />;
    return route.params.folder !== "trash" ? button : null;
  },
  deleteAsync() {
    const { folder, id } = route.params;
    store.dispatch((dispatch) => {
      setTimeout(() => {
        dispatch("mails/delete", { folder, id });
      }, 200);
    });
    history.back();
  },
});

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
