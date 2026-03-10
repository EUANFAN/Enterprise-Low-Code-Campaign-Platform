import { fetchJSON } from './BaseAPI';
import { QUERY_SEPARATOR } from 'common/constants';
import OSS from 'ali-oss';
import tools from 'common/tools';
const DEFAULT_PAGE_SIZE = 10;
const SEARCH_GROUP_KEYWORD_MY = 'my';
import { nanoid } from 'nanoid'

// 梁仔20230112
// 看过这部分代码，有问题。我尽量不删掉原来的代码了，暂时就用nanoid吧。
// 这一块从前端交互上来说有优化的空间。文件比对？
function formatFileName(file) {
  const { name } = file;
  let fileExt = name.replace(/.+\./, '');
  let fileName = name.replace(/(.*\/)*([^.]+).*/gi, '$2');
  // 去掉文件中的非法字符 去掉中文和中文符号，替换成随机数
  fileName = fileName
    .replace(/[<|>+\/\|\:\"\*\?\s\(\)\~\!\_\']/g, '')
    .replace(/[^\x00-\xff]/g, Math.floor(Math.random() * 100));

  fileName = nanoid()
  return `${fileName}-${Date.now()}.${fileExt}`;
}

async function uploadFile(file) {
  let name = formatFileName(file);
  const {
    data: {
      AccessKeyId: accessKeyId,
      AccessKeySecret: accessKeySecret,
      SecurityToken: securityToken,
      bucket
    }
  } = await getUploadConfig();
  const storage = new OSS({
    timeout: 10 * 60 * 1000, // 10分钟
    region: 'oss-cn-beijing',
    accessKeyId,
    accessKeySecret,
    stsToken: securityToken,
    refreshSTSToken: async () => {
      // 向您搭建的STS服务获取临时访问凭证。
      //   const info = await fetch('your_sts_server')
      return {
        accessKeyId,
        accessKeySecret,
        stsToken: securityToken
      };
    },
    // 刷新临时访问凭证的时间间隔，单位为毫秒。
    refreshSTSTokenInterval: 300000,
    // 填写Bucket名称。
    bucket
  });
  return new Promise((resolve) => {
    storage.put(`resource/${name}`, file).then(
      async (result) => {
        const { res } = result
        // 成功回调
        if (res.status == 200) {
          const obj = {
            md5Name: name,
            mimeType: file.type,
            name: file.name
          };
          const fileType = tools.getFileType(file.type);
          if (fileType === 'image') {
            const src = god.URL.createObjectURL(
              new Blob([file], { type: 'application/zip' })
            );
            obj.size = await god.ImageUtils.getImageDimension(src);
          }
          resolve(obj);
        }
      },
      (err) => {
        console.log('上传文件', err);
        console.log('err', err);
      }
    );
  });
}

export function getResourcesByType(
  type,
  current = 1,
  groupId = '',
  pageSize = DEFAULT_PAGE_SIZE
) {
  return fetchJSON(`/api/resources/${type}/${groupId}`, {
    official: groupId ? '0' : '1',
    current: current - 1,
    pageSize: pageSize
  });
}

export function getMyResourcesByType(
  type,
  current = 1,
  groupId = '',
  pageSize = DEFAULT_PAGE_SIZE
) {
  return fetchJSON(
    `/api/resources/my/${type}${groupId ? '/' + groupId : '/'}`,
    {
      current: Math.max(current - 1, 0),
      pageSize
    }
  );
}

// 目前只接受修改name，新增提交其他字段修改的话，需要更改 server 的 VALID_BODY_PARAMS array
export function updateFile(fileId, options) {
  return fetchJSON(`/api/resources/files/${fileId}`, {
    method: 'put',
    ...options
  });
}

// 目前只接受修改name，新增提交其他字段修改的话，需要更改 server 的 VALID_BODY_PARAMS array
export function updateFileGroup(groupId, options) {
  return fetchJSON(`/api/resources/file-groups/${groupId}`, {
    method: 'put',
    ...options
  });
}

export function createNewFolder(name, type, groupId = '') {
  return fetchJSON(`/api/resources/folders/${groupId}/folder`, {
    method: 'post',
    type,
    name
  });
}

export function addChildrenToGroupsList(groupId, children) {
  return fetchJSON(`/api/resources/folders/move/${groupId}`, {
    method: 'put',
    fileIds: children.join(QUERY_SEPARATOR)
  });
}

export function deleteResources(fileIds = []) {
  return fetchJSON(`/api/resources/${fileIds.join(QUERY_SEPARATOR)}`, {
    method: 'delete'
  });
}

export function deleteResourceFolders(groupIds = []) {
  return fetchJSON(`/api/resources/folders/${groupIds.join(QUERY_SEPARATOR)}`, {
    method: 'delete'
  });
}

export function getGroupsFolders(groupId = '', type) {
  return fetchJSON(`/api/resources/groups-folders/${groupId}`, { type });
}

export function downLoadResources(fileIds = []) {
  return fetchJSON(`/api/resources/${fileIds.join(QUERY_SEPARATOR)}/url`);
}

export function downLoadResourceFolders(groupIds = []) {
  return fetchJSON(
    `/api/resources/folders/${groupIds.join(QUERY_SEPARATOR)}/url`
  );
}

// TODO 目前因为 Group 结构问题导致实作的复杂度较大，因此这里先分开接口，等到 Group 结构改动后
// 再重构
export function searchResources(
  keyWord,
  type,
  groupId = SEARCH_GROUP_KEYWORD_MY,
  currentPage = 1
) {
  return fetchJSON(`/api/resources/search/${groupId}/${keyWord}`, {
    method: 'get',
    type,
    currentPage
  });
}

export function getUploadConfig() {
  return fetchJSON('/api/resources/config', {
    method: 'post'
  });
}

export async function uploadResource(files = [], folder) {
  let requestQueue = [],
    fileList = [];

  files.forEach((file) => {
    requestQueue.push(uploadFile(file));
  });
  fileList = await Promise.all(requestQueue);
  return fetchJSON(`/api/resources/folders/${folder}/files`, {
    method: 'post',
    files: JSON.stringify(fileList)
  });
}

export async function saveResource(file, folder) {
  return fetchJSON(`/api/resources/folders/${folder}/remoteFile`, {
    method: 'post',
    file: file
  });
}

export async function getUrlById(id = '') {
  // const api_domain = 'https://apigateway-dev.jiaoyanyun.com';

  return fetchJSON(`/api/resources/folders/getUrl/${id}`, {
    method: 'get'
  });
}
