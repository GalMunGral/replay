function format(s, length) {
  if (!s) return "(empty)";
  return s.length <= length ? s : s.slice(0, length) + "...";
}

export { format };
