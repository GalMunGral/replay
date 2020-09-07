import $mails from "@observables/mails";
import $router from "@observables/router";
import $selection from "@observables/selection";
import MailItem from "@components/MailItem/MailItem";
import * as actions from "./MailListActions";

const MailList = () => {
  return (
    // use-transform
    [
      ...$mails.currentPage.map((mail) =>
        MailItem(
          // (key = mail.id),
          (mail = mail),
          (folder = $router.folder),
          (selected = $selection.selected.includes(mail.id)),
          (toggleItem = () => actions.toggleItem(mail.id)),
          (deleteItem = () => actions.deleteItem(mail.id)),
          (selectItem = () => actions.selectAfter(mail, 300)),
          (viewItem = () => actions.cancelSelectAndOpen(mail)),
          (ondrag = actions.ondrag),
          (ondragstart = actions.ondragstart),
          (ondragend = actions.ondragend)
        )
      ),
    ]
  );
};

export default MailList;
