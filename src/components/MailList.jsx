const MailList = () =>
  $mails.currentPage.map((mail, i) => (
    <MailItem
      key={i}
      mail={mail}
      folder={$router.folder}
      selected={$selection.selected.includes(mail.id)}
      toggleItem={() => toggleItem(mail.id)}
      deleteItem={() => deleteItem(mail.id)}
      selectItem={() => selectAfter(mail, 300)}
      viewItem={() => cancelSelectAndOpen(mail)}
      dragEventListeners={dragEventListeners}
    />
  ));

import $mails from "@observables/mails";
import $router from "@observables/router";
import $selection from "@observables/selection";
import $editor from "@observables/editor";
import $store from "@observables/store";
import $dragState from "@observables/drag";
import MailItem from "@components/MailItem";

const OFFSET = 30;
var timer = null;

const toggleItem = (id) => {
  $selection.set(id, !$selection.selected.includes(id));
};

const deleteItem = (id) => {
  $store.dispatch((dispatch) => {
    setTimeout(() => {
      dispatch({
        type: $store.T.DELETE,
        payload: { folder: $router.folder, id },
      });
    }, 200);
  });
};

const selectAfter = (mail, delay) => {
  timer = setTimeout(() => {
    $selection.set(mail.id, true);
    timer = null;
  }, delay);
};

const cancelSelectAndOpen = (mail) => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
    if ($router.folder === "drafts") {
      $editor.replaceDraft(mail);
      $editor.minimized = false;
      $editor.open = true;
    } else {
      $router.navigate(`/${$router.folder}/${mail.id}`);
    }
  }
};

const dragEventListeners = {
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
};

export default MailList;
