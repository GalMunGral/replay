import Layout from "@components/Layout/Layout";
import DetailToolbar from "./DetailToolbar";
import { Main, Header, SenderInfo, RecipientInfo, Body } from "./Detail.decor";

import { printMessage } from "../shared";
printMessage();

const Detail = ({ folder, id }, context) => {
  const { $store, $router } = context;
  const { T } = $store;

  const mail = $store.getMail(folder, id);

  if (!mail) {
    $router.redirect("/" + folder);
    return /* use-transform */ h1("Redirecting");
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

  const canDelete = folder !== "trash";

  const deleteMail = () => {
    $store.dispatch((dispatch) => {
      window.history.back();
      setTimeout(() => {
        dispatch({
          type: T.DELETE,
          payload: { folder, id },
        });
      }, 200);
    });
  };

  return (
    // use-transform
    Layout([
      DetailToolbar((canDelete = canDelete), (deleteMail = deleteMail)),
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
