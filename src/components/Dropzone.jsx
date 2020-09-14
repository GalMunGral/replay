import { Observable, Observer, Link } from "replay/utils";
import $store from "../observables/store";
import $selection from "../observables/selection";
import { MenuItem, MenuIcon } from "./Menu";

const Dropzone = Observer(({ hidden }, { $drop, $route }) => [
  <Link to="/trash">
    <MenuItem
      hidden={hidden}
      activated={$route.params.folder === "trash"}
      style={{
        background: $drop.canDrop ? "var(--theme)" : "",
        color: $drop.canDrop ? "white" : "",
      }}
      ondragenter={$drop.dragenter.bind($drop)}
      ondragleave={$drop.drageleave.bind($drop)}
      ondragover={$drop.drageover.bind($drop)}
      ondrop={$drop.drop.bind($drop)}
    >
      <MenuIcon className="fas fa-trash" /> {!hidden && <span>trash</span>}
    </MenuItem>
  </Link>,
]);

Dropzone.init = (__, { $route }) => ({
  $drop: new Observable({
    canDrop: false,
    dragenter(e) {
      e.preventDefault();
      e.stopPropagation();
      this.canDrop = true;
    },
    drageleave() {
      this.canDrop = false;
    },
    drageover(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    drop() {
      $store.dispatch((dispatch) => {
        setTimeout(() => {
          dispatch({
            type: "DELETE_SELECTED",
            payload: {
              folder: $route.params.folder,
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

export default Dropzone;
