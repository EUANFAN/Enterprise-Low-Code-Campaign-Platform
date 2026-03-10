/**
 *
 * @description 是否仅自己可见
 * @param {*} status
 *  0：未审核
 *  1:审核中
 *  2：审核通过
 *  3：审核不通过
 * @returns
 */
export const NOAUDIT = (status) => status === 0;
export const AUDITING = (status) => status === 1;
export const AUDITSUCCESS = (status) => status === 2;
export const ADUIT_FAIL = (status) => status === 3;
export const isPrivate = (status) => [0, 1, 3].includes(status);
export const canShowAudit = (status) => NOAUDIT(status) || ADUIT_FAIL(status);
export const AUDITSTATUSMESSAGE = {
  0: '仅自己可见',
  3: ' 已打回',
};
export const AUDITBUTTONCONTENT = {
  0: '提交审核',
  3: '再次提审',
};
