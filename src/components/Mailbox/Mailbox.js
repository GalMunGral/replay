import Tab from "@components/Tab/Tab";
import MailList from "@components/MailList/MailList";
import Layout from "@components/Layout/Layout";
import MailboxToolbar from "@components/MailboxToolbar/MailboxToolbar";

import { TabBar } from "./Mailbox.decor";

const context = () => {
  return {
    $page: observable({
      tab: "primary",
      index: 0,
      pageSize: 50,
      get pageStart() {
        return this.index * this.pageSize;
      },
      get pageEnd() {
        return (this.index + 1) * this.pageSize;
      },
    }),
    $route: observable({
      folder: null,
    }),
    $mails: observable({
      currentPage: [],
      total: 0,
    }),
  };
};

const Mailbox = ({ folder }, { $page, $mails, $route, $store }) => {
  const { tab, pageStart, pageEnd } = $page;
  const allMails = $store.getMails(folder, tab);
  $mails.total = allMails.length;
  $mails.currentPage = allMails.slice(pageStart, pageEnd);
  $route.folder = folder;

  return (
    // use-transform
    Layout([
      MailboxToolbar(),
      section([
        folder === "inbox" &&
          TabBar(
            ["primary", "social", "promotions"].map((t) =>
              Tab({
                key: t,
                name: t,
                active: t === tab,
                onclick: () => {
                  $page.tab = t;
                  $page.index = 0;
                },
              })
            )
          ),
        MailList(),
      ]),
    ])
  );
};

Mailbox.context = context;

export default Mailbox;
