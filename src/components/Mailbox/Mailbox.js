import MailList from "@components/MailList/MailList";
import Layout from "@components/Layout/Layout";
import MailboxToolbar from "@components/MailboxToolbar/MailboxToolbar";
import Tabs from "./Tabs";

const init = () => {
  return {
    $mails: observable({
      allMails: [],
      tab: "primary",
      pageIndex: 0,
      pageSize: 50,
      get total() {
        return this.allMails.length;
      },
      get pageCount() {
        return Math.ceil(this.total / this.pageSize);
      },
      get pageStart() {
        return this.pageIndex * this.pageSize;
      },
      get pageEnd() {
        return Math.min((this.pageIndex + 1) * this.pageSize, this.total);
      },
      get currentPage() {
        return this.allMails.slice(this.pageStart, this.pageEnd);
      },
      nextPage() {
        this.pageIndex = Math.min(this.pageIndex + 1, this.pageCount - 1);
      },
      prevPage() {
        this.pageIndex = Math.max(this.pageIndex - 1, 0);
      },
    }),
    $route: observable({
      folder: null,
    }),
  };
};

const Mailbox = ({ folder }, { $mails, $route, $store, $selection }) => {
  const { tab } = $mails;
  $route.folder = folder;
  $mails.allMails = $store.getMails(folder, tab);

  const { currentPage } = $mails;
  const allSelected = $selection.allSelected(currentPage);
  const toggleAll = () => $selection.toggleAll(currentPage);

  return (
    // use-transform
    Layout([
      MailboxToolbar((allSelected = allSelected), (toggleAll = toggleAll)),
      section([
        // prettier-ignore
        Tabs((folder = folder), (activeTab = tab)),
        MailList(),
      ]),
    ])
  );
};

Mailbox.init = init;

export default Mailbox;
