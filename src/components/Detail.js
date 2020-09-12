const DetailToolbar = ({ canDelete, deleteMail }) => {
  return (
    //// use transform
    [
      IconButton((type = "arrow-left"), (onclick = () => history.back())),
      canDelete ? IconButton((type = "trash"), (onclick = deleteMail)) : null,
    ]
  );
};

const Detail = () => {
  if (!$mails.mail) {
    return (
      //// use transform
      h1((style = { margin: "50px auto" }), "Redirecting")
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
    //// use transform
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

import { decorator as $$ } from "replay/utils";
import $mails from "@observables/mails";
import $router from "@observables/router";
import Layout from "@components/Layout";
import IconButton from "@components/IconButton";

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
