import babel from './utils/babel';
import Path from './utils/path';
const { traverse, parse, generate, types } = babel;
export default class HandleEditor {
  constructor(state, type, isNewComponent) {
    this.state = state.reduce((memo, next) => {
      const { path, content } = next;
      memo[path] = content;
      return memo;
    }, {});
    this.Path = new Path(Object.keys(this.state));
    this.type = type;
    this.isNewComponent = isNewComponent;
    this.importedPath = ['index.js'];
  }
  get currentComponentContents() {
    const { state } = this;
    return state;
  }
  updateState(path, newValue) {
    const { state } = this;
    state[path] = newValue;
  }
  init() {
    const { state, type } = this;
    const content = state['index.js'];
    const newContent = this.handleContent(content);
    if (!this.isNewComponent) {
      this.updateState('index.js', newContent);
      return {
        [type]: this.importedPath.reduce((memo, next) => {
          memo[next] = this.state[next];
          return memo;
        }, {})
      };
    }
    return this.state;
  }
  handlePathAndContent = (url = []) => {
    const { Path } = this;
    url = Path.join(...url);
    let ext = Path.extname(url);
    const contents = this.currentComponentContents;
    if (['.js', '.json'].includes(ext)) {
      if (ext === '.json') {
        return [url, JSON.stringify(contents[url], null, 2)];
      } else {
        return [url, contents[url]];
      }
    }
  };
  handleContent(content, url = ['./']) {
    const { Path } = this;
    const ast = parse(content, {
      sourceType: 'module'
    });
    traverse(ast, {
      ImportDeclaration: {
        enter: (path) => {
          const { node } = path;
          if (!node) return;
          url = Path.handlePath(url.concat(node.source.value));
          const [value, newContent] = this.handlePathAndContent(url);
          this.importedPath.push(value);
          if (newContent) {
            this.updateState(value, this.handleContent(newContent, url));
          }
          this.replaceImportContent({ node, path, value });
          url.pop();
        }
      },
      'ExportDefaultDeclaration|ExportNamedDeclaration'(path) {
        let declaration = path.node.declaration;
        if (types.isFunctionDeclaration(declaration)) {
          declaration = types.functionExpression(
            declaration.id,
            declaration.params,
            declaration.body,
            declaration.generator,
            declaration.async
          );
        }
        const returnPath = types.expressionStatement(
          types.assignmentExpression(
            '=',
            types.isExportNamedDeclaration(path)
              ? types.memberExpression(
                  types.memberExpression(
                    types.identifier('module'),
                    types.identifier('exports')
                  ),
                  types.identifier(declaration.id.name)
                )
              : types.memberExpression(
                  types.identifier('module'),
                  types.identifier('exports')
                ),
            declaration
          )
        );
        path.replaceWith(returnPath);
      },
      VariableDeclaration: (path) => {
        if (
          path.node.kind === 'const' &&
          path.node.declarations[0].id.name === 'DAPENG_INJECT_DATA'
        ) {
          this.state = JSON.parse(
            generate(path.node.declarations[0].init).code
          ).editorMap;
        }
      }
    });
    const { code } = generate(ast);
    return code;
  }
  replaceImportContent({ node, path, value }) {
    const { type } = this;
    const importSpecifiers = [];
    const rightExpress = types.callExpression(
      types.identifier('daPeng_require'),
      [types.StringLiteral(`@${type}/${value}`)]
    );
    const keys = node.specifiers
      .map((spec) => {
        if (types.isImportSpecifier(spec)) {
          importSpecifiers.push(spec.imported);
          return undefined;
        } else {
          return types.variableDeclarator(spec.local, rightExpress);
        }
      })
      .filter((item) => item != null);
    if (importSpecifiers.length > 0) {
      keys.push(
        types.variableDeclarator(
          types.objectPattern(
            importSpecifiers.map((item) => types.objectProperty(item, item))
          ),
          rightExpress
        )
      );
    }
    const code = types.variableDeclaration('const', keys);
    path.replaceWith(code);
  }
}
