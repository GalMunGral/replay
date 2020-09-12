const MailList = () => {
  return (
    //// use transform
    [
      ...$mails.currentPage.map((mail) =>
        MailItem(
          // (key = mail.id),
          (mail = mail),
          (folder = $router.folder),
          (selected = $selection.selected.includes(mail.id)),
          (toggleItem = () => toggleItem(mail.id)),
          (deleteItem = () => deleteItem(mail.id)),
          (selectItem = () => selectAfter(mail, 300)),
          (viewItem = () => cancelSelectAndOpen(mail)),
          (ondrag = ondrag),
          (ondragstart = ondragstart),
          (ondragend = ondragend)
        )
      ),
    ]
  );
};

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

const ondrag = (e) => {
  $dragState.setCoordinates(e.clientX - OFFSET, e.clientY - OFFSET);
};

const ondragstart = (e) => {
  e.dataTransfer.setDragImage(new Image(), 0, 0);
  setTimeout(() => {
    $dragState.setIsDragging(true);
  }, 100);
};

const ondragend = () => {
  $dragState.setIsDragging(false);
};

export default MailList;
