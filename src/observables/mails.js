import { Observable } from "@replay/utils";
import $store from "./store";
import $router from "./router";

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

const $mails = new Observable({
  pageSize: 50,
  pageIndex: 0,
  get mail() {
    const state = $store.state;
    const { folder, id } = $router;
    const folderCache = cache.get(state).get(folder);
    if (!folderCache.has(id)) {
      const mail = state[folder].find((it) => it.id === id);
      folderCache.set(id, mail);
    }
    return folderCache.get(id);
  },
  get mails() {
    const state = $store.state;
    const { folder, tab } = $router;
    const folderCache = cache.get(state).get(folder);
    if (!folderCache.get(tab)) {
      const mails =
        folder === "inbox"
          ? state[folder].filter((it) => it.category === tab)
          : state[folder];
      folderCache.set(tab, mails);
    }
    return folderCache.get(tab);
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
  deleteMail() {
    $store.dispatch((dispatch) => {
      const { folder, id } = $router;
      window.history.back();
      setTimeout(() => {
        dispatch({
          type: $store.T.DELETE,
          payload: { folder, id },
        });
      }, 200);
    });
  },
});

export default $mails;
