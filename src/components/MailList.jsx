import { navigate } from "replay/utils";
import $selection from "../observables/selection";
import $editor from "../observables/editor";
import $store from "../observables/store";
import $dragState from "../observables/drag";
import MailItem from "./MailItem";

const MailList = (
  __,
  {
    $route,
    $mails,
    toggleItem,
    deleteItem,
    selectAfter,
    cancelSelectAndOpen,
    dragEventListeners,
  }
) =>
  $mails.currentPage.map((mail, i) => (
    <MailItem
      key={i}
      mail={mail}
      folder={$route.params.folder}
      selected={$selection.selected.includes(mail.id)}
      toggleItem={() => toggleItem(mail.id)}
      deleteItem={() => deleteItem(mail.id)}
      selectItem={() => selectAfter(mail, 300)}
      viewItem={() => cancelSelectAndOpen(mail)}
      dragEventListeners={dragEventListeners}
    />
  ));

const OFFSET = 30;
var timer = null;

MailList.init = (__, { $route }) => ({
  toggleItem: (id) => {
    $selection.set(id, !$selection.selected.includes(id));
  },
  deleteItem: (id) => {
    $store.dispatch((dispatch) => {
      setTimeout(() => {
        dispatch({
          type: $store.T.DELETE,
          payload: { folder: $route.params.folder, id },
        });
      }, 200);
    });
  },
  selectAfter: (mail, delay) => {
    timer = setTimeout(() => {
      $selection.set(mail.id, true);
      timer = null;
    }, delay);
  },
  cancelSelectAndOpen: (mail) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      if ($route.params.folder === "drafts") {
        $editor.replaceDraft(mail);
        $editor.minimized = false;
        $editor.open = true;
      } else {
        navigate(`/${$route.params.folder}/${mail.id}`);
      }
    }
  },
  dragEventListeners: {
    ondrag: (e) => {
      $dragState.setCoordinates(e.clientX - OFFSET, e.clientY - OFFSET);
    },
    ondragstart: (e) => {
      e.dataTransfer.setDragImage(new Image(), 0, 0);
      setTimeout(() => {
        $dragState.setIsDragging(true);
      }, 100);
    },
    ondragend: () => {
      $dragState.setIsDragging(false);
    },
  },
});

export default MailList;
