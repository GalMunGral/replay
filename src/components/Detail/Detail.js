import $mails from "@observables/mails";
import $router from "@observables/router";
import Layout from "@components/Layout/Layout";
import IconButton from "@components/Common/IconButton";
import { Main, Header, SenderInfo, RecipientInfo, Body } from "./Detail.decor";

const DetailToolbar = ({ canDelete, deleteMail }) => {
  return (
    // use-transform
    [
      IconButton((type = "arrow-left"), (onclick = () => history.back())),
      canDelete ? IconButton((type = "trash"), (onclick = deleteMail)) : null,
    ]
  );
};

const Detail = () => {
  if (!$mails.mail) {
    return /* use-transform */ h1(
      (style = { margin: "50px auto" }),
      "Redirecting"
    );
  }

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

  return (
    // use-transform
    Layout([
      DetailToolbar(
        (canDelete = $router.folder !== "trash"),
        (deleteMail = () => $mails.deleteMail())
      ),
      Main([
        Header(subject),
        SenderInfo((innerHTML = senderInfo)),
        RecipientInfo((innerHTML = recipientInfo)),
        Body(content),
      ]),
    ])
  );
};

export default Detail;
