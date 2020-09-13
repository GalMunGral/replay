import { Observable } from "replay/utils";

const $router = new Observable({
  params: {
    folder: null,
    id: null,
  },
  update() {
    this.params = location.pathname.match(
      /^\/(?<folder>[\w-]+)(\/(?<id>[\w-]+))?/
    ).groups;
  },
  navigate(path) {
    window.history.pushState(null, "", path);
    this.update();
  },
  redirect(path) {
    window.history.replaceState(null, "", path);
    this.update();
  },
});

window.onpopstate = () => {
  $router.update();
};

/^inbox|sent|drafts|trash$/.test(location.pathname)
  ? $router.redirect(location.pathname)
  : $router.redirect("/inbox");

export default $router;
