const path = require('path');
const readdir = require('fs-readdir-recursive');
const Config = require('config-cache');
const pathtoRegexp = require('path-to-regexp');
const fs = require('fs');
/**
 * 加载文件夹
 *
 * @param  {string} dir 目录路径
 * @return {Config}     配置
 */
const load = function (dir, callback) {
  const files = readdir(dir);

  files.forEach((file) => {
    const filename = path.basename(file, '.js');
    const dirname = path.basename(path.dirname(file));
    callback(dirname, require(dir + '/' + file), file, filename);
  });
};

/**
 * 加载配置文件夹
 *
 * @param  {string} dir 目录路径
 * @return {Config}     配置
 */
const loadConfig = function (dirs) {
  if (!Array.isArray(dirs)) {
    dirs = [dirs];
  }
  const config = new Config();
  dirs.forEach((dir) => {
    load(dir, (dirname, mod) => {
      let already = config.get(dirname);
      if (already) {
        config.set(dirname, Object.assign(already, mod));
      } else {
        config.set(dirname, mod);
      }
    });
  });
  return config;
};

/**
 * 加载controller文件夹
 *
 * @param  {string} dir 目录路径
 * @return {Config}     配置
 */
const loadController = function (dir) {
  const controllers = {};
  const regexController = { post: [], get: [] };

  load(dir, (dirname, mod, file) => {
    controllers['/' + file.replace(/\.js/, '')] = mod;

    if (mod.getPath) {
      regexController.get.push({
        regex: pathtoRegexp(mod.getPath),
        router: mod,
      });
    }
    if (mod.postPath) {
      regexController.post.push({
        regex: pathtoRegexp(mod.postPath),
        router: mod,
      });
    }
  });

  return { controllers, regexController };
};

/**
 * 加载plugin插件
 *
 * @param  {string} dir 目录
 * @return {Object}     插件列表
 */
const loadPlugin = function (dir) {
  let plugins = {};
  load(dir, (dirname, mod, file, filename) => {
    if (filename != 'index') {
      plugins[filename] = mod;
    }
  });
  return plugins;
};

/**
 * 加载plugin插件
 *
 * @param  {string} dir 目录
 * @return {Object}     插件列表
 */
const loadPluginSequence = function (dir) {
  let sequence = [];
  const sqeuenceFile = dir + 'index.js';
  if (fs.existsSync(sqeuenceFile)) {
    sequence = require(sqeuenceFile);
  }

  return sequence;
};

const loadLib = loadPlugin;

module.exports = {
  loadConfig,
  loadController,
  loadPlugin,
  loadPluginSequence,
  loadLib,
};
