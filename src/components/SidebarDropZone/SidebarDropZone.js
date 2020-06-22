import { MenuItem, MenuIcon } from "../Sidebar/Sidebar.decor";

const context = () => ({
  $self: observable({
    canDrop: false,
  }),
});

const SidebarDropZone = ({ collapsed, activated }, context) => {
  const { $self, $store, $selection, $router } = context;
  const { folder } = $router;
  const { T } = $store;

  const deleteAll = () => {
    $store.dispatch((dispatch) => {
      setTimeout(() => {
        dispatch({
          type: T.DELETE_SELECTED,
          payload: {
            folder,
            selected: $selection.selected,
          },
        });
        $selection.selected = new Set();
      }, 200);
    });
  };

  const eventListeners = {
    onclick: () => {
      $router.navigate("/trash");
    },
    ondragenter: (e) => {
      e.preventDefault();
      e.stopPropagation();
      $self.canDrop = true;
    },
    ondragover: (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    ondragleave: () => {
      $self.canDrop = false;
    },
    ondrop: () => {
      deleteAll();
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
      (style = style),
      { ...eventListeners },
      // prettier-ignore
      [
        MenuIcon((className = "fas fa-trash")), 
        !collapsed && span("trash")
      ]
    )
  );
};

SidebarDropZone.context = context;

export default SidebarDropZone;
