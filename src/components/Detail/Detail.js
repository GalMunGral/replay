import Layout from "@components/Layout/Layout";
import DetailToolbar from "@components/DetailToolbar/DetailToolbar";

import { Main, Header, SenderInfo, RecipientInfo, Body } from "./Detail.decor";

const Detail = ({ folder, id }, { $store, $router }) => {
  const mail = $store.getMail(folder, id);
  if (!mail) {
    $router.redirect("/" + folder);
    return (
      // use-transform
      p("Redirecting...")
    );
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
      window.history.back();
      setTimeout(
        () =>
          dispatch({
            type: $store.T.DELETE,
            payload: { id, folder },
          }),
        200
      );
    });
  };

  return (
    // use-transform
    Layout([
      DetailToolbar({ canDelete: folder !== "trash", deleteMail }),
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
