import MailList from "@components/MailList/MailList";
import Layout from "@components/Layout/Layout";
import MailboxToolbar from "@components/MailboxToolbar/MailboxToolbar";
import Tabs from "./Tabs";

const Mailbox = (__, { $mails, $selection }) => {
  const { currentPage } = $mails;
  const allSelected = $selection.allSelected(currentPage);
  const toggleAll = () => $selection.toggleAll(currentPage);

  return (
    // use-transform
    Layout([
      MailboxToolbar((allSelected = allSelected), (toggleAll = toggleAll)),
      section([
        // prettier-ignore
        Tabs(),
        MailList(),
      ]),
    ])
  );
};

export default Mailbox;
