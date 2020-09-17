export const stats = {
  renderCount: 0,
  reuseCount: 0,
  birthCount: 0,
  deathCount: 0,
  maxDepth: 0,
  get reuseRate() {
    return this.reuseCount / this.renderCount;
  },
  get deathRate() {
    return this.deathCount / this.birthCount;
  },
};
