const { transform } = require("@babel/core");

module.exports = (buffer, cb) => {
  const src = buffer.toString("utf-8");
  const options = {
    plugins: [require.resolve("@babel/plugin-transform-typescript")],
  };
  transform(src, options, (err, result) => {
    if (err) return cb(err);
    cb(null, result.code);
  });
};
