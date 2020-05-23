import { Observable } from "lib";

const router = Observable({
  folder: "",
  id: null,
  updateStateWithPath(path) {
    const result = path.match(/^\/(?<folder>[\w-]+)(\/(?<id>[\w-]+))?/);
    this.folder = result.groups.folder;
    this.id = result.groups.id;
  },
  updateHistorywithState(replace = false) {
    const { folder, id } = this;
    const path = id ? `/${folder}/${id}` : `/${folder}`;
    document.title = `Mail - ${folder.toUpperCase()}`;
    replace
      ? window.history.replaceState(null, "", path)
      : window.history.pushState(null, "", path);
  },
  navigate(path) {
    this.updateStateWithPath(path);
    this.updateHistorywithState(false);
  },
  redirect(path) {
    this.updateStateWithPath(path);
    this.updateHistorywithState(true);
  },
});

window.onpopstate = () => {
  router.updateStateWithPath(document.location.pathname);
};

const initialPath = document.location.pathname;
router.redirect(initialPath === "/" ? "/inbox" : initialPath);

export default router;
