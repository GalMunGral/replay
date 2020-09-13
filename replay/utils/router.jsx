import { Observable } from "./observable";

function makeRegex(pattern) {
  const segments = pattern.split("/");
  const regexSegments = segments.map((s) => {
    if (s.startsWith(":")) {
      return `(?<${s.slice(1)}>[\\w-]+)`;
    } else {
      return s;
    }
  });
  return new RegExp(regexSegments.join("/"));
}

const Router = () => {
  return [<div>TEST</div>];
};

// Router.init = (props, __, context) => {
//   const routes = props.children.map((routeDef) => {
//     return {
//       path: routeDef[1].path,

//     }
//   });
//   context.emit(() => {
//     window.onpopstate = () => {};
//     // TODO: This needs a cleanup when unmounted
//   });
//   return {};
// };

export default Router;

// new Observable({
//   params: {
//     folder: null,
//     tab: "primary",
//     id: null,
//   },
//   update() {
//     this.params = {
//       ...location.pathname.match(/^\/(?<folder>[\w-]+)(\/(?<id>[\w-]+))?/)
//         .groups,
//       tab: this.params.tab,
//     };
//   },
//   navigate(path) {
//     window.history.pushState(null, "", path);
//     this.update();
//   },
//   redirect(path) {
//     window.history.replaceState(null, "", path);
//     this.update();
//   },
// });

// window.onpopstate = () => {
//   $router.update();
// };

// /^inbox|sent|drafts|trash$/.test(location.pathname)
//   ? $router.redirect(location.pathname)
//   : $router.redirect("/inbox");

// export default $router;
