// 获取项目来源
function getProjectOrigin() {
  const {
    project: { origin },
  } = PageData;
  if (origin) {
    return origin;
  }
}

// 获取第三方创建项目的配置
function getThirdPartyConfig() {
  const {
    project: { origin, thirdPartyConfig },
  } = PageData;
  if (origin && thirdPartyConfig) {
    return thirdPartyConfig;
  }
}

export { getProjectOrigin, getThirdPartyConfig };
