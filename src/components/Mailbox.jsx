import {
  observer,
  DefaultMap,
  Fragment,
  createStore,
  navigate,
} from "replay/utils";
import Sidebar from "./Sidebar";
import MailItem from "./MailItem";
import Layout from "./Layout";
import MailboxToolbar from "./MailboxToolbar";
import Tabs from "./Tabs";

const Mailbox = observer((__, { store, mailbox, route, dragState }) => {
  const { folder } = route.params;
  const { current: selected } = store.state.selection;

  const createActions = (mail) => ({
    toggleItem: () => {
      store.dispatch("selection/toggle", mail);
    },
    deleteItem: () => {
      store.dispatch((dispatch) => {
        setTimeout(() => {
          dispatch("mails/delete", { folder, id: mail.id });
        }, 200);
      });
    },
  });

  const createEvents = (mail) => ({
    onclick() {
      folder === "drafts"
        ? store.dispatch("editor/editDraft", mail)
        : navigate(`/${folder}/${mail.id}`);
    },
    ondrag(e) {
      dragState.setCoordinates(e.clientX - 30, e.clientY - 30);
    },
    ondragstart(e) {
      e.dataTransfer.setDragImage(new Image(), 0, 0);
      store.dispatch("selection/select", mail);
      setTimeout(() => {
        dragState.isDragging = true;
      }, 100);
    },
    ondragend() {
      dragState.isDragging = false;
    },
  });

  return [
    <Sidebar />,
    <Layout>
      <MailboxToolbar />
      <Fragment>
        <Tabs />
        {...mailbox.state.currentPage.map((mail, i) => (
          <MailItem
            key={i}
            mail={mail}
            folder={folder}
            selected={selected.includes(mail.id)}
            actions={createActions(mail)}
            events={createEvents(mail)}
          />
        ))}
      </Fragment>
    </Layout>,
  ];
});

// TODO CHECK
const cache = new DefaultMap(() => new DefaultMap(() => null));

Mailbox.init = (__, { route, store }) => {
  return {
    mailbox: createStore({
      mutableState: {
        tab: "primary",
        pageSize: 50,
        pageIndex: 0,
        get all() {
          const { mails } = store.state;
          const { folder } = route.params;
          if (folder === "inbox") {
            const inbox = mails["inbox"];
            const inboxCache = cache.get(inbox);
            if (!inboxCache.get(this.tab)) {
              const tab = inbox.filter((mail) => mail.category === this.tab);
              inboxCache.set(this.tab, tab);
            }
            return inboxCache.get(this.tab);
          } else {
            return mails[folder];
          }
        },
        get total() {
          return this.all.length;
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
          return this.all.slice(this.pageStart, this.pageEnd);
        },
        get allSelected() {
          if (this.currentPage.length == 0) return false;
          const selectedSet = new Set(store.state.selection.current);
          return this.currentPage.every((item) => selectedSet.has(item.id));
        },
        toggleAll() {
          store.dispatch(
            this.allSelected ? "selection/deselectAll" : "selection/selectAll",
            this.currentPage
          );
        },
        setTab(tab) {
          this.tab = tab;
          this.pageIndex = 0;
        },
        nextPage() {
          this.pageIndex = Math.min(this.pageIndex + 1, this.pageCount - 1);
        },
        previousPage() {
          this.pageIndex = Math.max(this.pageIndex - 1, 0);
        },
      },
    }),
  };
};

export default Mailbox;
