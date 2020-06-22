const $router = observable({
  folder: "",
  id: "",

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
  const newPath = document.location.pathname;
  $router.updateStateWithPath(newPath);
};

const initialPath = document.location.pathname;
const newInitialPath = /^inbox|sent|drafts|trash$/.test(initialPath)
  ? initialPath
  : "/inbox";
$router.redirect(newInitialPath);

export default $router;
