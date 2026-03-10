/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-03-27 21:36:26
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-03-01 11:02:16
 */
import { PROJECTDATA } from 'common/defaultConstant';
import { observable } from 'mobx';
export default {
  userId: PROJECTDATA.userId,
  name: PROJECTDATA.name,
  pageTransition: PROJECTDATA.pageTransition,
  title: PROJECTDATA.title,
  keywords: PROJECTDATA.keywords,
  description: PROJECTDATA.description,
  comLogData: {},
  preLoadBackgroundImg: PROJECTDATA.preLoadBackgroundImg,
  pages: PROJECTDATA.pages,
  layout: PROJECTDATA.layout,
  dataUrl: PROJECTDATA.dataUrl,
  dataParams: observable.map({}),
  descUrl: PROJECTDATA.descUrl,
  descriptions: [],
  useData: PROJECTDATA.useData,
  usePreloader: PROJECTDATA.usePreloader,
  showDisplay: PROJECTDATA.showDisplay,
  userSelect: PROJECTDATA.userSelect,
  variableStore: observable.map({}),
  type: PROJECTDATA.type,
  pageState: observable.map({}),
  isUseSensor: PROJECTDATA.isUseSensor,
  sensorBusinessType: PROJECTDATA.sensorBusinessType,
  dynamicLoadScript: PROJECTDATA.dynamicLoadScript,
  backgroundColor: PROJECTDATA.backgroundColor,
  stageWidth: PROJECTDATA.stageWidth,
  maxWidth: PROJECTDATA.maxWidth,
  closeImgLazyLoad: PROJECTDATA.closeImgLazyLoad,
  thirdPartyConfig: PROJECTDATA.thirdPartyConfig,
  origin: PROJECTDATA.origin,
  runingStartTime: PROJECTDATA.runingStartTime,
  runingEndTime: PROJECTDATA.runingEndTime,
};
