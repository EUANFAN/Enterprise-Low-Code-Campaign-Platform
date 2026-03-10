export default class Path {
  constructor(paths) {
    this.paths = paths;
  }
  handleAlias(path) {
    const { paths, extname } = this;
    const alias = ['.js', '.json', '/index.js', '/index.json'];
    let ext = extname(path);
    if (!['.js', '.json'].includes(ext)) {
      ext = alias.shift();
      while (ext != null) {
        let p = path + ext;
        if (paths.includes(p)) {
          return ext;
        }
        ext = alias.shift();
      }
    }
    return ext;
  }
  extname(path = '') {
    const pathName = path.split('.').pop();
    return pathName ? '.' + pathName : '';
  }
  join(...args) {
    const paths = args.reduce((memo, next) => {
      const paths = next.split('/');
      memo = memo.concat(paths);
      return memo;
    }, []);
    let result = [];
    for (let path of paths) {
      if (path === '..') {
        result.pop();
        result.pop();
      } else if (path === '.') {
        result.pop();
      } else {
        result.push(path);
      }
    }
    return result.join('/');
  }
  handlePath(url) {
    const newUrls = url.slice();
    let lastElement = newUrls.pop();
    if (!['.js', '.json'].includes(this.extname(lastElement))) {
      lastElement += this.handleAlias(this.join(...newUrls, lastElement));
    }
    newUrls.push(lastElement);
    return newUrls;
  }
}
