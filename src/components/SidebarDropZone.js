import { withContext, Observable } from "lib";
import { MenuItem, MenuIcon } from "../elements/Sidebar";

const context = () => ({
  self$: Observable({
    canDrop: false,
  }),
});

const SidebarDropZone = (
  { collapsed, activated },
  { self$, store$, selection$, router$, router$: { folder } }
) => {
  const deleteAll = () => {
    store$.dispatch((dispatch) => {
      setTimeout(() => {
        dispatch({
          type: store$.T.DELETE_SELECTED,
          payload: {
            folder,
            selected: selection$.selected,
          },
        });
        selection$.selected = new Set();
      }, 200);
    });
  };

  const eventListeners = {
    onclick: () => router$.navigate("/trash"),
    ondragenter: (e) => {
      e.preventDefault();
      e.stopPropagation();
      self$.canDrop = true;
    },
    ondragover: (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    ondragleave: () => {
      self$.canDrop = false;
    },
    ondrop: () => {
      deleteAll();
      self$.canDrop = false;
    },
  };

  return (
    // use-transform
    MenuItem(
      (style = {
        background: self$.canDrop ? "var(--theme)" : "",
        color: self$.canDrop ? "white" : "",
      }),
      { collapsed },
      { activated },
      { ...eventListeners },

      // prettier-ignore
      [
        MenuIcon((className = "fas fa-trash")), 
        !collapsed && span("trash")
      ]
    )
  );
};

export default withContext(context)(SidebarDropZone);
