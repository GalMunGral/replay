module.exports = (buffer, cb) => {
  try {
    cb(null, buffer.toString("utf-8"));
  } catch (err) {
    cb(err);
  }
};
