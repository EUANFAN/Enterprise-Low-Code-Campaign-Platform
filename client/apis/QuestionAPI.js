import { post } from '@k9/x-com';
import moment from 'moment';

const md5 = require('md5');

// 生成签名 md5(sGroupId + ”-“ + productId + "-" + ADY3110 + "-" + 日期（2020-01-01)
function getSign(sGroupId, productId) {
  return md5(
    `${sGroupId}-${productId}-ADY3110-${moment().format('YYYY-MM-DD')}`
  );
}

/**
 * 获取某个活动用户填写的内容的列表
 * @param  {string} sGroupId  活动id
 * @param  {string} productId 项目id
 * @param  {string} page      页数
 * @param  {string} pageSize  每页数
 */
export function getQuestionsList({
  sGroupId,
  projectId: productId,
  page,
  pageSize,
}) {
  return post(
    'https://booster.xueersi.com/h5EditStationAdmin/Question/GetDataList',
    {
      sGroupId,
      page,
      pageSize,
      sign: getSign(sGroupId, productId),
      productId,
    }
  );
}

/**
 * 获取某个活动 某个用户填写的内容
 * @param  {string} sGroupId  活动id
 * @param  {string} productId 项目id
 * @param  {string} id        当前问卷id
 */
export function getQuestionsDetail({ sGroupId, projectId: productId, id }) {
  return post(
    'https://booster.xueersi.com/h5EditStationAdmin/Question/GetDataDetail',
    {
      sGroupId,
      id,
      sign: getSign(sGroupId, productId),
      productId,
    }
  );
}

/**
 * 生成某个活动的excel表
 * @param  {string} sGroupId  活动id
 * @param  {string} productId 项目id
 * @param  {string} userId    H5编辑平台的登录用户
 * @param  {string} taskName  项目名称
 */
export function generateExcel({
  sGroupId,
  projectId: productId,
  userId,
  taskName,
}) {
  return post(
    'https://booster.xueersi.com/h5EditStationAdmin/Task/CreateDownloadTask',
    {
      sGroupId,
      productId,
      memberId: userId,
      sign: getSign(sGroupId, productId),
      taskName,
    }
  );
}

/**
 * 根据H5编辑平台用户获取最新的任务的列表
 * @param  {string} sGroupId  活动id
 * @param  {string} productId 项目id
 * @param  {string} userId    H5编辑平台的登录用户
 */
export function getExcelListByUser({ sGroupId, projectId: productId, userId }) {
  return post(
    'https://booster.xueersi.com/h5EditStationAdmin/Task/CheckDownTask',
    {
      sGroupId,
      productId,
      memberId: userId,
      sign: getSign(sGroupId, productId),
    }
  );
}
