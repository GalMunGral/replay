import $store from "./store";
import $router from "./router";

export class DefaultMap extends Map {
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

const $mails = observable({
  pageSize: 50,
  pageIndex: 0,
  get mail() {
    const state = $store.state;
    const { folder, id } = $router;
    const _cache = cache.get(state).get(folder);
    if (!_cache.has(id)) {
      const mail = state[folder].find((it) => it.id === id);
      _cache.set(id, mail);
    }
    return _cache.get(id);
  },
  get mails() {
    const state = $store.state;
    const { folder, tab } = $router;
    const _cache = cache.get(state).get(folder);
    if (!_cache.get(tab)) {
      const mails =
        folder === "inbox"
          ? state[folder].filter((it) => it.category === tab)
          : state[folder];
      _cache.set(tab, mails);
    }
    return _cache.get(tab);
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
});

export default $mails;
