import { Observable } from "replay/utils";

const $router = new Observable({
  folder: null,
  tab: "primary",
  id: null,
  updateStateWithPath(path) {
    const result = path.match(/^\/(?<folder>[\w-]+)(\/(?<id>[\w-]+))?/);
    this.folder = result.groups.folder;
    this.id = result.groups.id;
  },
  updateHistoryWithState(replace = false) {
    const path = this.id ? `/${this.folder}/${this.id}` : `/${this.folder}`;
    replace
      ? window.history.replaceState(null, "", path)
      : window.history.pushState(null, "", path);
    document.title = `CMail - ${
      this.folder[0].toUpperCase() + this.folder.slice(1)
    }`;
  },
  navigate(path) {
    this.updateStateWithPath(path);
    this.updateHistoryWithState(false);
  },
  redirect(path) {
    this.updateStateWithPath(path);
    this.updateHistoryWithState(true);
  },
});

window.onpopstate = () => {
  $router.updateStateWithPath(location.pathname);
};

/^inbox|sent|drafts|trash$/.test(location.pathname)
  ? $router.redirect(location.pathname)
  : $router.redirect("/inbox");

export default $router;