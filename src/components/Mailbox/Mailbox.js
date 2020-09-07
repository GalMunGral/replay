import $mails from "@observables/mails";
import $router from "@observables/router";
import $selection from "@observables/selection";
import MailList from "@components/MailList/MailList";
import Layout from "@components/Layout/Layout";
import MailboxToolbar from "@components/MailboxToolbar/MailboxToolbar";
import { TabBar, Box, Icon } from "./Mailbox.decor";

const allTabs = ["primary", "social", "promotions"];
const iconMap = {
  primary: "inbox",
  social: "user-friends",
  promotions: "tag",
};

const Tab = ({ name, key, active, onclick }) =>
  // use-transform
  Box({ name, key, active, onclick }, [
    Icon({ className: `fas fa-${iconMap[name]}` }),
    p(name),
  ]);

const Tabs = () => {
  const { folder, tab: activeTab } = $router;
  return folder === "inbox"
    ? // use-transform
      TabBar(
        allTabs.map((tab) =>
          Tab(
            (name = tab),
            (key = tab),
            (active = tab === activeTab),
            (onclick = () => {
              $router.tab = tab;
              $mails.pageIndex = 0;
            })
          )
        )
      )
    : [null];
};

const Mailbox = () =>
  // use-transform
  Layout([
    MailboxToolbar(
      (allSelected = $selection.allSelected($mails.currentPage)),
      (toggleAll = () => $selection.toggleAll($mails.currentPage))
    ),
    section([
      // prettier-ignore
      Tabs(),
      MailList(),
    ]),
  ]);

export default Mailbox;
