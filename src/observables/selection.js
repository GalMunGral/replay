const $selection = observable({
  selected: [],
  set(id, shouldSelect) {
    if (shouldSelect) {
      if (!this.selected.includes(id)) {
        this.selected = this.selected.concat(id);
      }
    } else {
      if (this.selected.includes(id)) {
        this.selected = this.selected.filter((i) => i !== id);
      }
    }
  },
  reset() {
    this.selected = [];
  },
  allSelected(mails) {
    if (!mails.length) return false;
    return mails.every((item) => this.selected.includes(item.id));
  },
  toggleAll(mails) {
    if (this.allSelected(mails)) {
      this.selected = [];
    } else {
      this.selected = mails.map((item) => item.id);
    }
  },
});

export default $selection;
