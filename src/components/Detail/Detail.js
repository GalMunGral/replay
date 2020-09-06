import Layout from "@components/Layout/Layout";
import DetailToolbar from "./DetailToolbar";
import { Main, Header, SenderInfo, RecipientInfo, Body } from "./Detail.decor";

const Detail = function* (__, { $store, $mails, $router }) {
  const { T } = $store;
  const { mail } = $mails;
  const { folder, id } = $router;

  if (!mail) {
    yield () => $router.redirect("/" + folder);
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
