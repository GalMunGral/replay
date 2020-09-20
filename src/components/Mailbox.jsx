import { Fragment, createStore, navigate } from "replay/utils";
import Sidebar from "./Sidebar";
import MailItem from "./MailItem";
import Layout from "./Layout";
import MailboxToolbar from "./MailboxToolbar";
import Tabs from "./Tabs";

const Mailbox = (__, { mailbox, mapDataToProps }) => {
  return [
    <Sidebar />,
    <Layout>
      <MailboxToolbar />
      <Fragment>
        <Tabs />
        {...mailbox.state.currentPage
          .map(mapDataToProps)
          .map((props, i) => <MailItem key={i} {...props} />)}
      </Fragment>
    </Layout>,
  ];
};

Mailbox.init = ({}, { route, store, dragState }) => ({
  mailbox: createStore({
    mutableState: {
      tab: "primary",
      pageSize: 50,
      pageIndex: 0,
      get all() {
        const { mails } = store.state;
        const { folder } = route.params;
        return folder === "inbox"
          ? mails["inbox"].filter((mail) => mail.category === this.tab)
          : mails[folder];
      },
      get total() {
        return this.all.length;
      },
      get pageCount() {
        return Math.max(Math.ceil(this.total / this.pageSize), 1);
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
        const action = this.allSelected
          ? "selection/deselectAll"
          : "selection/selectAll";
        store.dispatch(action, this.currentPage);
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
  mapDataToProps: (mail) => {
    const { folder } = route.params;
    const { selectedSet } = store.state.selection;
    return {
      mail,
      folder,
      selected: selectedSet.has(mail.id),
      toggleItem: () => {
        store.dispatch("selection/toggle", mail);
      },
      deleteItem: () => {
        store.dispatch((dispatch) => {
          setTimeout(() => {
            dispatch("mails/delete", { folder, id: mail.id });
            dispatch("selection/deselect", mail);
          }, 200);
        });
      },
      onclick() {
        folder === "drafts"
          ? store.dispatch("editor/editDraft", mail)
          : navigate(`/${folder}/${mail.id}`);
      },
      ondragstart(e) {
        store.dispatch("selection/select", mail);
        e.dataTransfer.setDragImage(new Image(), 0, 0);
        dragState.setCoordinates(e.clientX - 30, e.clientY - 30);
        dragState.isDragging = true;
      },
      ondrag(e) {
        dragState.setCoordinates(e.clientX - 30, e.clientY - 30);
      },
      ondragend() {
        dragState.isDragging = false;
      },
    };
  },
});

export default Mailbox;
