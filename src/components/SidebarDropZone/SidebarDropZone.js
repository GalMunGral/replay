import { MenuItem, MenuIcon } from "../Sidebar/Sidebar.decor";

const init = () => {
  return {
    $self: observable({
      canDrop: false,
    }),
  };
};

const SidebarDropZone = ({ collapsed, activated }, context) => {
  const { $self, $store, $selection, $router } = context;
  const { folder } = $router;
  const { T } = $store;

  const eventListeners = {
    onclick: () => {
      $router.navigate("/trash");
    },
    ondragenter: (e) => {
      e.preventDefault();
      e.stopPropagation();
      $self.canDrop = true;
    },
    ondragleave: () => {
      $self.canDrop = false;
    },
    ondragover: (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    ondrop: () => {
      $store.dispatch((dispatch) => {
        setTimeout(() => {
          dispatch({
            type: T.DELETE_SELECTED,
            payload: {
              folder,
              selected: $selection.selected,
            },
          });
          $selection.reset();
        }, 200);
      });
      $self.canDrop = false;
    },
  };

  const style = {
    background: $self.canDrop ? "var(--theme)" : "",
    color: $self.canDrop ? "white" : "",
  };

  return (
    // use-transform
    MenuItem(
      (collapsed = collapsed),
      (activated = activated),
      { style, ...eventListeners },
      // prettier-ignore
      [
        MenuIcon((className = "fas fa-trash")), 
        !collapsed && span("trash")
      ]
    )
  );
};

SidebarDropZone.init = init;

export default SidebarDropZone;
