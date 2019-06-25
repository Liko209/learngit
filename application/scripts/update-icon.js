const axios = require('axios');
const fs = require('fs');
const path = require('path');

axios
  .get(
    `https://i.icomoon.io/public/6483cc0f53/Jupiter/symbol-defs.svg?${Math.random()}`,
  )
  .then(res => {
    const svgSpritePath = path.join(__dirname, '../public/jupiter-icon.svg');
    fs.writeFile(svgSpritePath, res.data, 'utf8', err => {
      if (err) throw err;
      console.log('icon updated');

      var markup = res.data;
      var lines = markup.split(/\n/g);
      var symbols = {};
      var currentSymbol = null;

      const startReg = /symbol.*?id="(.*?)".*?viewBox="(.*?)"/i;
      const endReg = /<\/symbol>/i;

      lines.forEach(function(line) {
        var start = line.match(startReg);
        var close = line.match(endReg);

        if (close) {
          currentSymbol = null;
        } else if (currentSymbol !== null) {
          if (!currentSymbol['content']) {
            currentSymbol['content'] = [];
          }
          currentSymbol['content'].push(line);
        } else if (start) {
          currentSymbolId = start[1];
          currentSymbolViewBox = start[2];
          symbols[currentSymbolId] = {};
          symbols[currentSymbolId]['id'] = currentSymbolId;
          symbols[currentSymbolId]['viewBox'] = currentSymbolViewBox;
          currentSymbol = symbols[currentSymbolId];
        }
      });

      function generateSVGFile({
        width = null,
        height = null,
        viewBox = null,
        content = null,
      }) {
        if (!content) return null;
        const widthValue = width !== null ? `width="${width}px"` : '';
        const heightValue = height !== null ? `height="${height}px"` : '';
        const viewBoxValue = viewBox !== null ? `viewBox="${viewBox}"` : '';
        const contentValue = content.join('\n');

        return `<?xml version="1.0" encoding="UTF-8"?>
<svg ${widthValue} ${heightValue} ${viewBoxValue} version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
${contentValue}
</svg>
`;
      }

      const jupiterIconPath = path.join(
        __dirname,
        `../../packages/jui/src/assets/jupiter-icon`,
      );

      if (fs.existsSync(jupiterIconPath)) {
        files = fs.readdirSync(jupiterIconPath);
        files.forEach((file, index) => {
          let curPath = jupiterIconPath + '/' + file;
          if (fs.statSync(curPath).isDirectory()) {
            delDir(curPath);
          } else {
            fs.unlinkSync(curPath);
          }
        });
      }

      if (!fs.existsSync(jupiterIconPath)) {
        fs.mkdirSync(jupiterIconPath);
      }

      Object.keys(symbols).forEach(symbolId => {
        const symbol = symbols[symbolId];
        const svg = generateSVGFile({
          viewBox: symbol.viewBox,
          content: symbol.content,
        });
        if (svg) {
          fs.writeFileSync(`${jupiterIconPath}/${symbolId}.svg`, svg);
        }
      });
    });
  });
