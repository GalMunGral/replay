import $router from "@observables/router";
import $selection from "@observables/selection";
import $editor from "@observables/editor";
import $store from "@observables/store";
import $dragState from "@observables/drag";

const OFFSET = 30;
var timer = null;

export const toggleItem = (id) => {
  $selection.set(id, !$selection.selected.includes(id));
};

export const deleteItem = (id) => {
  $store.dispatch((dispatch) => {
    setTimeout(() => {
      dispatch({
        type: $store.T.DELETE,
        payload: { folder: $router.folder, id },
      });
    }, 200);
  });
};

export const selectAfter = (mail, delay) => {
  timer = setTimeout(() => {
    $selection.set(mail.id, true);
    timer = null;
  }, delay);
};

export const cancelSelectAndOpen = (mail) => {
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

export const ondrag = (e) => {
  $dragState.setCoordinates(e.clientX - OFFSET, e.clientY - OFFSET);
};

export const ondragstart = (e) => {
  e.dataTransfer.setDragImage(new Image(), 0, 0);
  setTimeout(() => {
    $dragState.setIsDragging(true);
  }, 100);
};

export const ondragend = () => {
  $dragState.setIsDragging(false);
};
