const postcss = require("postcss");
const path = require("path");
const fs = require("fs");
const config = require("./config");

module.exports = ({ code, filePath }, cb) => {
  const plugin = () => {
    return {
      postcssPlugin: "transform-url",
      Declaration(decl) {
        const matches = decl.value.matchAll(/url\((.*?)\)/g);
        for (let match of matches) {
          const relativePath = match[1]
            .replace(/^['"`](.*)['"`]$/, "$1")
            .replace(/[?#].*$/, ""); // Not sure about this
          if (!relativePath.startsWith(".")) return;
          const absolutePath = path.join(path.dirname(filePath), relativePath);
          // const encoded = Buffer.from(absolutePath)
          //   .toString("base64")
          //   .slice(-10);
          // const filename = encoded + path.extname(absolutePath);
          const filename = path.basename(absolutePath);
          const outputPath = path.join(
            process.cwd(),
            config.contentBase,
            filename
          );
          fs.copyFileSync(absolutePath, outputPath);
          const url = "/" + filename;
          decl.value = decl.value.replace(match[0], `url("${url}")`);
        }
      },
    };
  };
  plugin.postcss = true;

  try {
    postcss([plugin])
      .process(code, { from: filePath })
      .then((result) => {
        // BUGFIX: All backslashes need to be escaped when put inside a literal
        // i.e. \ -> "\\"
        const escapedCss = result.css.replace(/\\/g, "\\\\");
        console.log(result.css);
        console.log(escapedCss);
        const module = `
        const style = \`${escapedCss}\`;
        const styleElement = document.createElement('style');
        styleElement.textContent = style;
        window.addEventListener('DOMContentLoaded', () => {
          document.head.appendChild(styleElement)
        });
        export default style;
        `;
        console.log(module);
        cb(null, module);
      });
  } catch (err) {
    cb(err);
  }
};
