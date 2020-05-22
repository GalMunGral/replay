import { Observable } from "lib";

const selection$ = Observable({
  selected: new Set(),
  set(id, shouldSelect) {
    if (shouldSelect) {
      if (!this.selected.has(id)) {
        this.selected.add(id);
        this.selected = new Set(this.selected);
      }
    } else {
      if (this.selected.has(id)) {
        this.selected.delete(id);
        this.selected = new Set(this.selected);
      }
    }
  },
});

export default selection$;
