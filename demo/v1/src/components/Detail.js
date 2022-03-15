import Layout from "./Layout";
import DetailToolbar from "./DetailToolbar";
import {
  Main,
  Header,
  SenderInfo,
  RecipientInfo,
  Body,
} from "./DetailComponents";

const Detail = (__, context) => ({ mailId }) => {
  const { getFolder, redirect } = context.route;
  const { getState } = context.store;
  const folder = getFolder();
  const allMails = getState();
  const mail = allMails[folder].find((item) => item.id === mailId);

  if (!mail) {
    redirect("/" + folder);
    return /* use-transform */ p("Redirecting...");
  }

  const {
    subject,
    senderName,
    senderEmail,
    recipientName,
    recipientEmail,
    content,
  } = mail;

  const senderInfo = `${senderName || "(no name)"}&nbsp;&lt;${
    senderEmail || "(no email)"
  }&gt;`;
  const recipientInfo = `To: ${recipientName || "(no name)"}&nbsp;&lt;${
    recipientEmail || "(no email)"
  }&gt;`;

  return (
    // use-transform
    // prettier-ignore
    Layout([
      DetailToolbar(),
      Main([
        Header(subject),
        SenderInfo(innerHTML=senderInfo),
        RecipientInfo(innerHTML=recipientInfo),
        Body(content),
      ]),
    ])
  );
};

export default Detail;
