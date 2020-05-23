import { Observable } from "lib";

const router = Observable({
  folder: "",
  id: null,
  updateStateWithPath(path) {
    const result = path.match(/^\/(?<folder>[\w-]+)(\/(?<id>[\w-]+))?/);
    this.folder = result.groups.folder;
    this.id = result.groups.id;
  },
  updateHistorywithContext(replace = false) {
    const { folder, id } = this;
    const path = id ? `/${folder}/${id}` : `/${folder}`;
    document.title = `Mail - ${folder}`;
    replace
      ? window.history.replaceState(null, "test", path)
      : window.history.pushState(null, "test", path);
  },
  navigate(path) {
    this.updateStateWithPath(path);
    this.updateHistorywithContext(false);
  },
  redirect(path) {
    this.updateStateWithPath(path);
    this.updateHistorywithContext(true);
  },
});

window.onpopstate = () => {
  const newPath = document.location.pathname;
  router.updateStateWithPath(newPath);
};

const initialPath = document.location.pathname;
router.redirect(initialPath === "/" ? "/inbox" : initialPath);

export default router;
