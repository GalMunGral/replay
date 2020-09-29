const { transform } = require("@babel/core");

module.exports = ({ code }, cb) => {
  const options = {
    plugins: [require.resolve("@babel/plugin-transform-typescript")],
  };
  transform(code, options, (err, result) => {
    if (err) return cb(err);
    cb(null, result.code);
  });
};
