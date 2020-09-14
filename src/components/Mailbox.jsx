import { Observer, Observable, Fragment } from "replay/utils";
import $selection from "../observables/selection";
import Sidebar from "./Sidebar";
import $store from "../observables/store";
import MailList from "./MailList";
import Layout from "./Layout";
import MailboxToolbar from "./MailboxToolbar";
import Tabs from "./Tabs";

class DefaultMap extends Map {
  constructor(factory) {
    super();
    this.factory = factory;
  }
  get(key) {
    if (!this.has(key)) {
      this.set(key, this.factory());
    }
    return super.get(key);
  }
}

const cache = new DefaultMap(() => {
  return new DefaultMap(() => {
    return new DefaultMap(() => null);
  });
});

const Mailbox = Observer((__, { $mails }) => {
  const page = $mails.currentPage;
  return [
    <Sidebar />,
    <Layout>
      <MailboxToolbar
        allSelected={$selection.allSelected(page)}
        toggleAll={() => $selection.toggleAll(page)}
      />
      <Fragment>
        <Tabs />
        <MailList />
      </Fragment>
    </Layout>,
  ];
});

Mailbox.init = (__, { $route }) => ({
  $mails: new Observable({
    tab: "primary",
    pageSize: 50,
    pageIndex: 0,
    get mails() {
      const state = $store.state;
      const { folder } = $route.params;
      const folderCache = cache.get(state).get(folder);
      const key = folder === "inbox" ? this.tab : "all";
      if (!folderCache.get(key)) {
        const mails =
          folder === "inbox"
            ? state[folder].filter((it) => it.category === this.tab)
            : state[folder];
        folderCache.set(key, mails);
      }
      return folderCache.get(key);
    },
    get total() {
      return this.mails.length;
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
      return this.mails.slice(this.pageStart, this.pageEnd);
    },
    nextPage() {
      this.pageIndex = Math.min(this.pageIndex + 1, this.pageCount - 1);
    },
    prevPage() {
      this.pageIndex = Math.max(this.pageIndex - 1, 0);
    },
  }),
});

export default Mailbox;
