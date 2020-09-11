import { decorator as $$ } from "@replay/utils";
import $mails from "@observables/mails";
import $router from "@observables/router";
import $selection from "@observables/selection";
import MailList from "@components/MailList";
import Layout from "@components/Layout";
import MailboxToolbar from "@components/MailboxToolbar";

const allTabs = ["primary", "social", "promotions"];

const iconMap = {
  primary: "inbox",
  social: "user-friends",
  promotions: "tag",
};

const colorMap = {
  primary: "#f44336",
  social: "#2962ff",
  promotions: "#2e7d32",
};

export const TabBar = $$.div`
  flex: 0 0 50px;
  display: flex;
  justify-content: start;
  border-bottom: 1px solid var(--light-gray);
`;

export const Icon = $$.i`
  margin: 0 20px;
`;

export const Box = $$.div`
  --height: 55px;
  display: inline-block;
  position: relative;
  height: var(--height);
  line-height: var(--height);
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: start;
  text-transform: capitalize;
  width: 250px;
  color: ${({ active, name }) => (active ? colorMap[name] : "gray")};
  cursor: pointer;
  transition: background 0.02s ease-in-out;
  
`.and`::after {
    content: "";
    position: absolute;
    left: 5%;
    bottom: 0;
    border-radius: 3px 3px 0 0;
    width: 90%;
    height: 3px;
    background: ${({ active, name }) =>
      active ? colorMap[name] : "transparent"};
  }
`.and`:hover {
    background: var(--light-gray);
  }
`;

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
