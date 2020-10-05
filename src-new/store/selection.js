import { createStore } from "replay-next/utils";

const selection = createStore({
  mutableState: {
    current: [], // immutable!
    get selectedSet() {
      return new Set(this.current);
    },
    reset() {
      this.current = [];
    },
    select(mail) {
      if (!this.current.includes(mail.id)) {
        this.current = this.current.concat(mail.id);
      }
    },
    deselect(mail) {
      if (this.current.includes(mail.id)) {
        this.current = this.current.filter((id) => id !== mail.id);
      }
    },
    toggle(mail) {
      if (!this.current.includes(mail.id)) {
        this.current = this.current.concat(mail.id);
      } else {
        this.current = this.current.filter((id) => id !== mail.id);
      }
    },
    selectAll(mails) {
      const selected = mails.map((mail) => mail.id);
      this.current = [...new Set(this.current.concat(selected))];
    },
    deselectAll(mails) {
      const deselected = new Set(mails.map((mails) => mails.id));
      this.current = this.current.filter((id) => !deselected.has(id));
    },
  },
});

export default selection;
