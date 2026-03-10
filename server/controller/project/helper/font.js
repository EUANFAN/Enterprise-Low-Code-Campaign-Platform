let path = require('path');
const Cheerio = require('cheerio');
const app = global.app;
const FONT_REGEX =
  /font-family:\s*(['"])?([\u4e00-\u9fa5\w\s,]+)+\1(?:,\s*|\s*;)/;

/**
 * 获取一段dom内容中的字体与文字对应
 * @param  {Node} dom             一个 cheerio 节点
 * @param  {Object} [fontMap={}]  字体 Map
 * @param  {String} [font=""]     目前字体
 * @return {[type]}               字体 Map
 */
function getFontMap(dom, fontMap = {}, font = '') {
  const children =
    typeof dom.children === 'function' ? dom.children() : dom.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const attrs = child.attribs;
    const match = attrs && attrs.style && FONT_REGEX.exec(attrs.style);
    const firstFont = match && match[2] && match[2].split(',')[0];
    const renderFont = (firstFont && firstFont.trim()) || font;
    if (child.type === 'text') {
      const text = child.data.trim();
      if (text) {
        fontMap[renderFont] = (fontMap[renderFont] || '') + text;
      }
      continue;
    }

    if (child.children) {
      getFontMap(child, fontMap, renderFont);
    }
  }
  return fontMap;
}

/**
 * 获取所有的字体
 * @param  {Object} component 组件
 * @param  {Object} fonts     字体结果
 * @return {Object}           [description]
 */
function getAllFonts(component, fonts = {}) {
  let children =
    (component.revisionData && component.revisionData.pages) ||
    component.widgets ||
    component.layers ||
    [];
  children.forEach((child) => {
    // 区分是否为UI组件
    if (child.visible !== undefined) {
      if (child.type == 'NormalText') {
        const fontIdentifier =
          child.data.fontFamily + '-' + child.data.fontWeight;

        fonts[fontIdentifier] = fonts[fontIdentifier] || '';
        if (child.data.needAllFontFamily) {
          fonts[fontIdentifier] = true;
        } else {
          if (
            fonts[fontIdentifier] !== true &&
            typeof child.data.content === 'string'
          ) {
            fonts[fontIdentifier] += child.data.content.replace(/\n/g, '');
          }
        }
      }
      if (child.type === 'RichText') {
        const $ = Cheerio.load(`
                    <div id="font-mapper-root">${child.data.content}</div>
                `);
        const root = $('#font-mapper-root');
        const fontMap = getFontMap(root, {}, 'PingFangSC-Regular');

        for (let fontIdentifier in fontMap) {
          fonts[fontIdentifier] =
            (fonts[fontIdentifier] || '') + fontMap[fontIdentifier];
        }
      }
    }

    getAllFonts(child, fonts);
  });

  return fonts;
}

/**
 * 获取所有的样式
 *
 * @param  {Object} component 组件
 * @param  {Array} resources 资源表
 * @return {Object}           样式结果
 */
async function getAllStyles(component, resources = []) {
  let fonts = getAllFonts(component);
  let styles = [];
  for (let fontName of Object.keys(fonts)) {
    const needAllFontFamily = fonts[fontName] === true;
    const suffix =
      fonts[fontName] === true
        ? ''
        : encodeURIComponent(fonts[fontName] + '1234567890,');
    const apiUrl =
      app.config.get('3rd').services +
      `/font/min?name=${fontName}&text=${suffix}&all=${needAllFontFamily}`;
    const createFontFileResult = await app.utils.api({ url: apiUrl });

    let filePaths = createFontFileResult.data;

    if (!filePaths) {
      continue;
    }

    if (!Array.isArray(filePaths)) {
      filePaths = [filePaths];
    }
    const srcs = await Promise.all(
      filePaths.map(async (filePath) => {
        if (!filePath || typeof filePath !== 'string') {
          return '';
        }
        const fileName = path.basename(filePath);
        const result = await app.utils.uploader.uploadFileByPath(
          'font/' + fileName,
          filePath
        );
        const url =
          result && result.data.file_url_https.replace(/https:\/\//g, '//');
        const extension = path.extname(fileName).slice(1);
        resources.push(url);

        return `url("${url}") format("${
          extension === 'ttf' ? 'truetype' : extension
        }")`;
      })
    );
    // NOTE We search local font here first to solve a iOS extracted
    // PingFang font issue. This is not scaled, since we can't make sure
    // that we always have the correct font name.
    srcs.unshift(`local("${fontName}")`);

    styles.push(`
            @font-face {
                font-family: ${fontName};
                src: ${srcs.join(', ')};
            }
        `);
  }
  return styles;
}

module.exports = { getAllStyles };
