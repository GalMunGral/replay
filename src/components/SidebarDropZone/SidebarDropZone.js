import $store from "@observables/store";
import $router from "@observables/router";
import $selection from "@observables/selection";
import { MenuItem, MenuIcon } from "../Sidebar/Sidebar.decor";

const init = () => ({
  $self: observable({
    canDrop: false,
    onclick() {
      $router.navigate("/trash");
    },
    ondragenter(e) {
      e.preventDefault();
      e.stopPropagation();
      this.canDrop = true;
    },
    ondragleave() {
      this.canDrop = false;
    },
    ondragover(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    ondrop() {
      $store.dispatch((dispatch) => {
        setTimeout(() => {
          dispatch({
            type: $store.T.DELETE_SELECTED,
            payload: {
              folder: $router.folder,
              selected: $selection.selected,
            },
          });
          $selection.reset();
        }, 200);
      });
      this.canDrop = false;
    },
  }),
});

const SidebarDropZone = ({ collapsed }, { $self }) =>
  // use-transform
  MenuItem(
    (collapsed = collapsed),
    (activated = $router.folder === "trash"),
    (style = {
      background: $self.canDrop ? "var(--theme)" : "",
      color: $self.canDrop ? "white" : "",
    }),
    (onclick = $self.onclick.bind($self)),
    (ondragenter = $self.ondragenter.bind($self)),
    (ondragleave = $self.ondragleave.bind($self)),
    (ondragover = $self.ondragover.bind($self)),
    (ondrop = $self.ondrop.bind($self)),
    [MenuIcon((className = "fas fa-trash")), !collapsed && span("trash")]
  );

SidebarDropZone.init = init;

export default SidebarDropZone;
