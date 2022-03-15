import Tab from "./Tab";
import MailList from "./MailList";
import Layout from "./Layout";
import MailboxToolbar from "./MailboxToolbar";
import { Container } from "./MailboxComponents";

const Mailbox = (_, context) => {
  const { getFolder, getTab, setTab } = context.route;
  const { getPage, resetPage } = context.pagination;

  return () => {
    const folder = getFolder();
    const currentTab = getTab();
    const page = getPage();

    const tabs =
      // use-transform
      // prettier-ignore
      Container(
        ["primary", "social", "promotions"].map((tab) =>
          Tab(
            key=tab,
            name=tab,
            active=(tab === currentTab),
            onclick=() => {
              setTab(tab);
              resetPage();
            }
          )
        )
      );

    return (
      // use-transform
      // prettier-ignore
      Layout([
        MailboxToolbar(),
        section([
          folder === "inbox" ? tabs[0] : null,
          MailList(mails=page),
        ]),
      ])
    );
  };
};

export default Mailbox;
