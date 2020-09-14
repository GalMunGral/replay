import { navigate } from "replay/utils";
import $selection from "../observables/selection";
import $editor from "../observables/editor";
import $store from "../observables/store";
import $dragState from "../observables/drag";
import MailItem from "./MailItem";

const MailList = (__, { $route, $mails, toggleItem, deleteItem, selectItem }) =>
  $mails.currentPage.map((mail, i) => (
    <MailItem
      key={i}
      mail={mail}
      folder={$route.params.folder}
      selected={$selection.selected.includes(mail.id)}
      toggleItem={() => toggleItem(mail.id)}
      deleteItem={() => deleteItem(mail.id)}
      eventListeners={{
        onclick() {
          if ($route.params.folder === "drafts") {
            $editor.replaceDraft(mail);
            $editor.minimized = false;
            $editor.open = true;
          } else {
            navigate(`/${$route.params.folder}/${mail.id}`);
          }
        },
        ondrag(e) {
          $dragState.setCoordinates(e.clientX - OFFSET, e.clientY - OFFSET);
        },
        ondragstart(e) {
          e.dataTransfer.setDragImage(new Image(), 0, 0);
          selectItem(mail.id);
          setTimeout(() => {
            $dragState.setIsDragging(true);
          }, 100);
        },
        ondragend() {
          $dragState.setIsDragging(false);
        },
      }}
    />
  ));

const OFFSET = 30;

MailList.init = (__, { $route }) => ({
  selectItem: (id) => {
    $selection.set(id, true);
  },
  toggleItem: (id) => {
    $selection.set(id, !$selection.selected.includes(id));
  },
  deleteItem: (id) => {
    $store.dispatch((dispatch) => {
      setTimeout(() => {
        dispatch({
          type: "DELETE",
          payload: { folder: $route.params.folder, id },
        });
      }, 200);
    });
  },
});

export default MailList;
