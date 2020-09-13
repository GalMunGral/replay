const DetailToolbar = ({ canDelete, deleteMail }) => [
  <IconButton type="arrow-left" onclick={() => history.back()} />,
  canDelete && <IconButton type="trash" onclick={deleteMail} />,
];

const Detail = () => {
  if (!$mails.mail)
    return [<h1 style={{ margin: "50px auto" }}>Redirecting</h1>];
  const {
    subject,
    senderName = "(no name)",
    senderEmail = "(no email)",
    recipientName = "(no name)",
    recipientEmail = "(no email)",
    content,
  } = $mails.mail;
  const senderInfo = `${senderName}&nbsp;&lt;${senderEmail}&gt;`;
  const recipientInfo = `To: ${recipientName}&nbsp;&lt;${recipientEmail}&gt;`;
  return [
    <Layout>
      <DetailToolbar
        canDelete={$router.params.folder !== "trash"}
        deleteMail={() => $mails.deleteMail()}
      />
      <Main>
        <Header>{subject}</Header>
        <SenderInfo innerHTML={senderInfo} />
        <RecipientInfo innerHTML={recipientInfo} />
        <Body>{content}</Body>
      </Main>
    </Layout>,
  ];
};

import { decorator as $$ } from "replay/utils";
import $mails from "../observables/mails";
import $router from "../observables/router";
import Layout from "./Layout";
import IconButton from "./IconButton";

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
