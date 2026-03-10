const Promise = require('bluebird');
const Router = require('koa-router');
const request = require('koa2-request');
const uuid = require('uuid');
const { keyBy, pick } = require('lodash');
const crypto = require('crypto');
const {
  PermissionDeniedError,
  InvalidParameterError
} = require('../../errors');
const { getFileType } = require('./utils/UploadUtils');
const checkLogin = require('./checkLogin');
const { FileTypes, QUERY_SEPARATOR } = require('../../constants');

const { mongo, uploader, urls } = global.app.utils;
const db = mongo.db();
const H5_URL = urls.H5_URL;
const { ObjectId } = mongo.pmongo;
const router = new Router({ prefix: '/resources' });

// Check login in all handlers in this route
router.use(checkLogin);

const DEFAULT_PAGE_SIZE_PARAM = `${Number.MAX_SAFE_INTEGER}`;
const UPLOAD_CATEGORY = 'resource';
const DEFAULT_PAGE_NUMBER = 10;

// TODO Move this to config || 没有用到这id，到线上确认
const OFFICIAL_RESOURCE_GROUP = ObjectId('5a687a8bdddf2af4bd8050aa');
const FOLDER_KEY_MY = 'my';
const FOLDER_KEY_OFFICIAL = 'official';

async function validateParameters(target, parameters) {
  const keyArray = typeof parameters === 'string' ? [parameters] : parameters;

  if (!Object.keys(target).length) {
    throw new InvalidParameterError('缺少必要参数');
  }

  const isValid = keyArray.every(() => !!target[keyArray]);

  if (!isValid) {
    throw new InvalidParameterError('缺乏必要参数');
  }
}

async function recursivelyFindGroupChildren(groupIds) {
  let allGroupIds = [];
  let fileIds = [];
  let pendingGroupIds = groupIds;

  while (pendingGroupIds.length !== 0) {
    const groups = await db.files.find({ parentId: { $in: pendingGroupIds } });
    allGroupIds = [...allGroupIds, ...pendingGroupIds];
    const pendingFileIds = groups.filter((v) => !v.isFolder).map((v) => v._id);
    const newPendingGroupIds = groups
      .filter((v) => v.isFolder)
      .map((v) => v._id);
    fileIds = [...fileIds, ...pendingFileIds];
    pendingGroupIds = newPendingGroupIds;
  }
  return { groupIds: allGroupIds, fileIds };
}

async function validateFolderDeleteAccess(userId, groupObjectIds) {
  const groups = await db.files.find({ _id: { $in: groupObjectIds } });
  if (groups && groups.every((group) => group.creator === userId)) {
    return;
  }

  throw new PermissionDeniedError('无删除权限');
}

async function validateFileDeleteAccess(userId, fileObjectIds) {
  const files = await db.files.find({ _id: { $in: fileObjectIds } });
  if (files && files.every((file) => file.creator === userId)) {
    return;
  }

  throw new PermissionDeniedError('无删除权限');
}

/**
 * 用给出的信息验证一个用户是否有操作一个组的权限
 * @param {Object} user
 * @param {Object} group
 * @return {Boolean}
 */
// async function validateGroup(user, group) {
//   // 用户角色是否含组角色
//   if (user.roleIds.includes(group.roleId)) return true;
//   // 是不是我的
//   if (group.isDefault === 1 && group.owner === user.userId) return true;
//   return false;
// }

/**
 * 用userid 以及 groupId 查找相应document并调用验证，如果不符合则抛出错误
 * @param {String} userId
 * @param {String} groupId
 */
async function validateGroupUpdateAccess(userId, groupId) {
  const group = await db.files.findOne({ _id: ObjectId(groupId) });
  // if (validateGroup(user, group)) return;
  if (group.creator === userId) return;

  throw new PermissionDeniedError('无编辑权限');
}

/**
 * @api       {get}  /api/resources/:type/:groupId?  获取选定形态的资源，为图片、视频、音频、file
 * @apiName   GetResources
 * @apiGroup  Resource
 *
 * @apiDescription  获取选定形态的资源，为图片、视屏或音屏。默认获取用户自己的资源，若要获取
 * 系统自带的资源，需要带上 official 参数
 *
 * @apiSuccess (200) {Number} errno    Error number or string
 * @apiSuccess (200) {String} msg      Message or error message
 * @apiSuccess (200) {Object} data     List of user ID
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": {
 *              "list": [
 *                  "chenbangjing",
 *                  "zhangjiealex"
 *              ]
 *           }
 *       }
 *
 */
const FOLDER_PREVIEW_IMAGE_COUNT = 4;
router.get('/(my)?/(image|video|audio|file)/:groupId?', async (ctx) => {
  const {
    params: { 0: my, 1: targetType, groupId },
    query: {
      current: currentParam = '0',
      pageSize: pageSizeParam = DEFAULT_PAGE_SIZE_PARAM
    }
  } = ctx;
  const current = parseInt(currentParam, 10);
  const { userId } = await ctx.getUserInfo();
  const pageSize = parseInt(pageSizeParam, 10);
  const start = current * pageSize;

  const targetGroupId = groupId
    ? ObjectId(groupId)
    : my
    ? null // eslint-disable-line indent
    : OFFICIAL_RESOURCE_GROUP; // eslint-disable-line indent

  let resources, total, groupName, folderInfoMap;
  let breadcrumbList = [];

  let [result] = await db.files.aggregateCursor(
    {
      $match: {
        type: targetType,
        creator: userId,
        deleted: { $in: [null, false] },
        parentId: { $in: [targetGroupId] }
      }
    },
    {
      $project: {
        _id: 1,
        id: 1,
        expireTime: 1,
        parentId: 1,
        name: 1,
        type: 1,
        url: 1,
        size: 1,
        isFolder: 1,
        createdAt: 1,
        creator: '$creator',
        lastModified: '$lastModified',
        children: '$children'
      }
    },
    { $sort: { lastModified: -1 } },
    {
      $group: {
        _id: null,
        list: { $push: '$$CURRENT' },
        total: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: false,
        list: {
          $slice: ['$list', start, pageSize]
        },
        total: 1
      }
    }
  );
  total = result ? result.total : 0;
  resources = result ? result.list : [];
  for (let file of resources) {
    if (file.expireTime && file.expireTime >= Date.now()) {
      const id = file.id;
      const key = 'AXOKIYSB';
      const path = '/contentapi/video/getVideoUrls';
      const timestamp = Date.now();
      const Nonce = uuid.v4().replace(/-/g, '');
      const AppSecret = 'db93b3152ae76fb670eb264e58ff63cc';
      const hash = crypto.createHash('sha256');
      hash.update(`${key}-${path}-${timestamp}-${Nonce}-${AppSecret}`);
      const Signature = hash.digest('hex').toUpperCase();
      const base_url = 'https://apigateway.jiaoyanyun.com';
      const confInfo = await request(
        `${base_url}${path}?extraData=eyJ1c2VyIjp7InVzZXJOYW1lIjoi5ZOI5ZOI5ZOIIiwidXNlcklkIjoiMTAwODYifX0`,
        {
          body: JSON.stringify({
            videoIdList: [id],
            extraData: {}
          }),
          method: 'post',
          headers: {
            'X-Api-Signature': Signature,
            'X-Api-Key': key,
            'Content-Type': 'application/json',
            'X-Api-Timestamp': timestamp,
            'X-Api-Nonce': Nonce
          }
        }
      );
      const body = JSON.parse(confInfo.toJSON().body);
      const data = body.data || [];
      await db.files.update(
        {
          _id: file._id
        },
        {
          $set: {
            lastModified: new Date(),
            url: data[0].videoPlayUrl,
            expireTime: data[0].expireTime
              ? new Date(data[0].expireTime).getTime()
              : undefined
          }
        }
      );
    }
  }
  const newFolderIds = resources
    .filter((projectOrFolder) => projectOrFolder.isFolder)
    .map((folder) => folder._id)
    .map(ObjectId);
  if (newFolderIds[0]) {
    const newFolderInfoList = await db.files.aggregateCursor(
      {
        $match: {
          parentId: { $in: newFolderIds },
          deleted: { $ne: true }
        }
      },
      {
        $project: {
          parentId: 1,
          _id: 1,
          url: 1,
          size: 1,
          isFolder: 1,
          name: 1
        }
      },
      {
        $group: {
          _id: '$parentId',
          list: { $push: '$$CURRENT' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 1,
          list: { $slice: ['$list', 0, FOLDER_PREVIEW_IMAGE_COUNT] },
          count: 1
        }
      }
    );
    folderInfoMap = keyBy(newFolderInfoList, '_id');
  }
  let _tempId = targetGroupId;
  while (_tempId) {
    const targetFileFolder = await db.files.findOne({
      _id: _tempId,
      deleted: { $ne: true }
    });
    if (targetFileFolder) {
      groupName = targetFileFolder.name;
      breadcrumbList.unshift(targetFileFolder);
      _tempId = targetFileFolder.parentId;
    } else {
      _tempId = null;
    }
  }
  breadcrumbList.unshift({
    name: `我的${
      { image: '图片', video: '视频', audio: '音频', file: '文档' }[targetType]
    }`,
    _id: '',
    isMy: true,
    type: targetType
  });
  ctx.data({
    resources,
    folderInfoMap,
    groupId: targetGroupId,
    breadcrumbList,
    groupName,
    total: Math.ceil(total / pageSize)
  });
});

/**
 * @api       {get}  /api/resources/groups/:groupId?filter=folders|image|video|audio 得到对应组的信息
 *
 * 暂时的做法 上方的接口 router.get('/(my)?/(image|video|audio)/:groupId?'
 * 完成对 group 中 image、video、audio类型的children的查找返回
 * 本接口完成 对 folder 类型 children的查找返回
 * file system 数据结构修改后，
 * 两个接口合二为一 get(/:roleId/:groupId/:fileId?filter=image|video|audio|folder)
 */
router.get('/groups-folders/:groupId?', async (ctx) => {
  const {
    params: { groupId },
    query: { type }
  } = ctx;
  const { userId } = await ctx.getUserInfo();
  const parentId = groupId === FOLDER_KEY_MY ? null : ObjectId(groupId);

  const result = await db.files.find({
    creator: userId,
    isFolder: true,
    parentId,
    type,
    deleted: { $ne: true }
  });
  ctx.data(result);
});


// 上传
router.post('/folders/:folderIdOrReservedKey/files', async (ctx) => {
  const {
    request: {
      body: { files }
    },
    params: { folderIdOrReservedKey }
  } = ctx;
  const { userId } = await ctx.getUserInfo();
  let parentId = null;
  if (folderIdOrReservedKey !== FOLDER_KEY_MY) {
    // 没有group:office都上传到 my，即null
    parentId =
      folderIdOrReservedKey === FOLDER_KEY_OFFICIAL
        ? null
        : folderIdOrReservedKey;
  }

  const nFiles = JSON.parse(files);
  const fileInstances = await Promise.map(nFiles, async (file) => {
    const { name, mimeType, md5Name, size } = file;
    const fileType = getFileType(mimeType);
    let fileUrl = `${H5_URL}/${UPLOAD_CATEGORY}/${md5Name}`;

    // get 时使用这个来排序，所以写入时需要lastModified, 假如将来增加了 crateTime 可以取消
    let fileInstance = {
      name,
      deleted: false,
      creator: userId,
      parentId: parentId ? ObjectId(parentId) : null,
      size,
      type: fileType,
      url: fileUrl,
      lastModified: new Date()
    };
    return db.files.insert(fileInstance);
  });

  return ctx.data({ files: fileInstances });
});

// 保存远程文件
router.post('/folders/:folderIdOrReservedKey/remoteFile', async (ctx) => {
  const {
    request: {
      body: { file }
    },
    params: { folderIdOrReservedKey }
  } = ctx;
  const { userId } = await ctx.getUserInfo();
  let parentId = null,
    size = null;

  if (folderIdOrReservedKey !== FOLDER_KEY_MY) {
    // 没有group:office都上传到 my，即null
    parentId =
      folderIdOrReservedKey === FOLDER_KEY_OFFICIAL
        ? null
        : folderIdOrReservedKey;
  }

  const { name, type, url } = file;
  if (type === FileTypes.IMAGE) {
    size = file.size;
  }
  // get 时使用这个来排序，所以写入时需要lastModified, 假如将来增加了 crateTime 可以取消
  let fileInstance = {
    name,
    deleted: false,
    creator: userId,
    parentId: parentId ? ObjectId(parentId) : null,
    size,
    type: type,
    url: url,
    lastModified: new Date(),
    id: file.id,
    expireTime: file.expireTime
      ? new Date(file.expireTime).getTime()
      : undefined
  };
  await db.files.insert(fileInstance);

  return ctx.data(null);
});
/**
 * 更新远程地址
 */
router.post(
  '/update/folders/:folderIdOrReservedKey/remoteFile',
  async (ctx) => {
    const {
      request: {
        body: { file }
      },
      params: { folderIdOrReservedKey }
    } = ctx;
    let parentId = null;
    if (folderIdOrReservedKey !== FOLDER_KEY_MY) {
      // 没有group:office都上传到 my，即null
      parentId =
        folderIdOrReservedKey === FOLDER_KEY_OFFICIAL
          ? null
          : folderIdOrReservedKey;
    }
    const id = file.id;
    const key = 'AXOKIYSB';
    const path = '/contentapi/video/getVideoUrls';
    const timestamp = Date.now();
    const Nonce = uuid.v4().replace(/-/g, '');
    const AppSecret = 'db93b3152ae76fb670eb264e58ff63cc';
    const hash = crypto.createHash('sha256');
    hash.update(`${key}-${path}-${timestamp}-${Nonce}-${AppSecret}`);
    const Signature = hash.digest('hex').toUpperCase();
    const base_url = 'https://apigateway.jiaoyanyun.com';
    const confInfo = await request(
      `${base_url}${path}?extraData=eyJ1c2VyIjp7InVzZXJOYW1lIjoi5ZOI5ZOI5ZOIIiwidXNlcklkIjoiMTAwODYifX0`,
      {
        body: JSON.stringify({
          videoIdList: [id],
          extraData: {}
        }),
        method: 'post',
        headers: {
          'X-Api-Signature': Signature,
          'X-Api-Key': key,
          'Content-Type': 'application/json',
          'X-Api-Timestamp': timestamp,
          'X-Api-Nonce': Nonce
        }
      }
    );
    const body = JSON.parse(confInfo.toJSON().body);
    const data = body.data || [];
    await db.files.update(
      {
        _id: ObjectId(file._id)
      },
      {
        $set: {
          lastModified: new Date(),
          url: data[0].videoPlayUrl,
          expireTime: data[0].expireTime
            ? new Date(data[0].expireTime).getTime()
            : undefined
        }
      }
    );
    ctx.data(body);
  }
);

const PUT_File_VALID_BODY_PARAMS = ['name'];
/**
 * @api       {put}  /api/resources/files/:fileId 修改某文件（图片、音频、视频）的信息
 */
router.put('/files/:fileId', async (ctx) => {
  const {
    params: { fileId },
    request: { body }
  } = ctx;
  const parameters = pick(body, PUT_File_VALID_BODY_PARAMS);

  await Promise.all([
    validateParameters(parameters, PUT_File_VALID_BODY_PARAMS)
  ]);

  await db.files.update(
    {
      _id: ObjectId(fileId)
    },
    {
      $set: {
        lastModified: new Date(),
        ...parameters
      }
    }
  );

  ctx.data(null);
});

const PUT_File_GROUP_VALID_BODY_PARAMS = ['name'];
/**
 * @api       {put}  /api/resources/file-groups/:groupId 修改某文件夹的信息
 */
router.put('/file-groups/:groupId', async (ctx) => {
  const {
    params: { groupId },
    request: { body }
  } = ctx;

  const { userId } = await ctx.getUserInfo();

  const parameters = pick(body, PUT_File_GROUP_VALID_BODY_PARAMS);

  await Promise.all([
    validateParameters(parameters, PUT_File_GROUP_VALID_BODY_PARAMS)
  ]);

  await db.files.update(
    {
      _id: ObjectId(groupId),
      creator: userId
    },
    {
      $set: {
        lastModified: new Date(),
        ...parameters
      }
    }
  );

  ctx.data(null);
});

/**
 * @api       {post}  /api/resources/folders/:groupId/folder  新建文件夹
 * @apiName   createNewFolder
 * @apiGroup  Resource
 *
 * @apiDescription  新建文件夹，官方新建文件夹时 groupid是'official'，
 * group 里面新建时对应相应的 groupId；
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": {
 *              "resource": {
 *                   lastModified: "2018-10-30T07:53:09.580Z"
 *                   name: "笑死我"
 *                   owner: "xxx"
 *                   roleId: "5a0541f469eb87490896219e"
 *                   type: "file"
 *                   isFolder: false
 *                   _id: "5bd80de53e02f677c94c1756"
 *              }
 *           }
 *       }
 *
 */
// groupid: 客户端请求过来都是 official。资源文件仅自己可见，管理员/分组不可见
router.post('/folders/:groupId/folder', async (ctx) => {
  const {
    params: { groupId },
    request: {
      body: { name, type }
    }
  } = ctx;

  const { userId } = await ctx.getUserInfo();

  // 非官方 与 用户不是admin 时
  if (groupId !== FOLDER_KEY_OFFICIAL) {
    throw new PermissionDeniedError('无权限添加文件');
  }
  let parentId = null;
  if (groupId !== FOLDER_KEY_MY) {
    parentId = groupId === FOLDER_KEY_OFFICIAL ? null : groupId;
  }

  const newResourceId = ObjectId();
  const now = new Date();
  const newResource = {
    _id: newResourceId,
    name,
    creator: userId,
    createdAt: now,
    lastModified: now,
    type,
    isFolder: true,
    parentId: parentId ? ObjectId(parentId) : null
  };

  const resource = await db.files.insert(newResource);
  ctx.data({ resource });
});

/**
 * @api       {delete}  /api/resources/folders/:fileIds  删除资源文件夹
 * @apiName   DeleteResourcesFolders
 * @apiGroup  Resource
 *
 * @apiDescription  删除所给定的所有文件夹。这里 fileIds 是以 "+" 字符分开的字串
 *
 * @apiSuccess (200) {Number} errno    Error number or string
 * @apiSuccess (200) {String} msg      Message or error message
 *
 **/

router.delete('/folders/:folderIds?', async (ctx) => {
  const {
    params: { folderIds }
  } = ctx;

  const { userId } = await ctx.getUserInfo();

  const folderIdArray = folderIds.split(QUERY_SEPARATOR).map(ObjectId);
  await validateFolderDeleteAccess(userId, folderIdArray);

  const { groupIds, fileIds } = await recursivelyFindGroupChildren(
    folderIdArray
  );
  await Promise.all([
    db.files.update(
      {
        _id: { $in: groupIds.concat(fileIds) },
        creator: userId
      },
      { $set: { deleted: true } },
      { multi: true }
    )
  ]);

  ctx.data();
});

/**
 * @api       {delete}  /api/resources/:fileIds  删除资源
 * @apiName   DeleteResources
 * @apiGroup  Resource
 *
 * @apiDescription  删除所给定的所有档案。这里 fileIds 是以 "+" 字符分开的字串
 *
 * @apiSuccess (200) {Number} errno    Error number or string
 * @apiSuccess (200) {String} msg      Message or error message
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": {}
 *       }
 *
 */

router.delete('/:fileIds?', async (ctx) => {
  const {
    params: { fileIds }
  } = ctx;

  const { userId } = await ctx.getUserInfo();

  const fileIdArray = fileIds.split(QUERY_SEPARATOR).map(ObjectId);
  await validateFileDeleteAccess(userId, fileIdArray);

  await db.files.update(
    { _id: { $in: fileIdArray } },
    { $set: { deleted: true } },
    { multi: true }
  );

  ctx.data();
});

/**
 * @api       {get}  /api/resources/:fileIds/url  下载资源
 * @apiName   DownLoadResourcesFiles
 * @apiGroup  Resource
 *
 * @apiDescription  下载所给定的所有档案。这里 fileIds 是以 "+" 字符分开的字串
 *
 * @apiSuccess (200) {Number} errno    Error number or string
 * @apiSuccess (200) {String} msg      Message or error message
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": [
 *              {
 *                 url:'xxx',
 *                 name:'xxx',
 *              }
 *          ]
 *       }
 *
 */
router.get('/:fileIds?/url', async (ctx) => {
  const {
    params: { fileIds }
  } = ctx;
  const fileIdArray = fileIds.split(QUERY_SEPARATOR).map(ObjectId);
  const downLoadFiles = await db.files.find(
    { _id: { $in: fileIdArray } },
    { name: 1, url: 1, _id: 0 }
  );

  ctx.data(downLoadFiles);
});

/**
 * @api       {get}  /api/resources/folders/:fileIds/url  下载资源文件夹
 * @apiName   DownLoadResourcesFoldersFiles
 * @apiGroup  Resource
 *
 * @apiDescription 下载所给定的所有文件夹里面的档案。这里 fileIds 是以 "+" 字符分开的字串
 *
 * @apiSuccess (200) {Number} errno    Error number or string
 * @apiSuccess (200) {String} msg      Message or error message
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": [
 *              {
 *                 url:'xxx',
 *                 name:'xxx',
 *              }
 *          ]
 *      }
 *
 **/
router.get('/folders/:folderIds?/url', async (ctx) => {
  const {
    params: { folderIds }
  } = ctx;
  const folderIdArray = folderIds.split(QUERY_SEPARATOR).map(ObjectId);
  const { fileIds } = await recursivelyFindGroupChildren(folderIdArray);
  let downLoadFiles = await db.files.find(
    { _id: { $in: fileIds } },
    { url: 1, name: 1, _id: 0 }
  );

  ctx.data(downLoadFiles);
});

/**
 * @api       {put}  /api/resources//:fileIds/move/:groupId' 把 files 移动到 group
 */
// router.put('/:fileIds/move/:groupId', async (ctx) => {
router.put('/folders/move/:groupId', async (ctx) => {
  const {
    params: { groupId },
    request: { body }
  } = ctx;
  const { userId } = await ctx.getUserInfo();

  const { fileIds } = body;
  const validator = ['fileIds'];
  await Promise.all([
    validateParameters(body, validator),
    validateGroupUpdateAccess(userId, groupId)
  ]);

  const fileObjectIds = fileIds.split(QUERY_SEPARATOR).map(ObjectId);
  const parentId = groupId === FOLDER_KEY_MY ? null : ObjectId(groupId);

  await db.files.update(
    {
      _id: { $in: fileObjectIds },
      creator: userId
    },
    {
      $set: {
        parentId,
        lastModified: new Date()
      }
    },
    { multi: true }
  );

  ctx.data(null);
});

/**
 * @api       {get}  /api/resources/search/:name/:type 根据名称和类型搜索文件和文件夹
 * @apiName   searchResources
 * @apiGroup  Resource
 *
 * @apiDescription 根据关键字搜索文件以及文件夹
 *
 * @apiSuccess (200) {Number} errno    Error number or string
 * @apiSuccess (200) {String} msg      Message or error message
 * @apiSuccess (200) {data}
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": {
 *                  resources: [
 *                      {
 *                         folders: ["5bd8261e386ea9b8d0847d89", "5bd8268a386ea9b8d0847d8a",…]
 *                         isSub: 1
 *                         lastModified: "2018-04-09T08:09:46.147Z"
 *                         list: [{_id: "5acb20c3e34eeb6b7ed55775", type: "image"},…]
 *                         name: "标签"
 *                         owner: "zhaoruixiukatherine"
 *                         type: "file"
 *                         _id: "5acb1fca0846a3727e627a89"
 *                      }
 *                      ...
 *                  ],
 *                  folderUrlMap: [
 *                      {
 *                          _id: "5bdac05255686d7e216258de",
 *                          urls: ["example.domain.com/logo.png"]
 *                      },
 *                      ...
 *                  ]
 *                  total: 2,
 *          }
 *
 *      }
 *
 **/
router.get('/search/:groupId/:keyWord', async (ctx) => {
  const {
    params: { keyWord },
    query: { type, currentPage }
  } = ctx;
  const keyWordRegex = RegExp(keyWord);
  const { userId } = await ctx.getUserInfo();
  const [filesResults] = await Promise.all([
    db.files.find({
      type,
      creator: userId,
      $or: [
        { title: keyWordRegex },
        { name: keyWordRegex },
        { owner: keyWordRegex }
      ],
      deleted: { $ne: true }
    })
  ]);
  const startIndex = (currentPage - 1) * DEFAULT_PAGE_NUMBER;
  const endIndex = currentPage * DEFAULT_PAGE_NUMBER;

  const result = [...filesResults];
  const pageTotal = Math.ceil(result.length / DEFAULT_PAGE_NUMBER);
  const currentItems = result.slice(startIndex, endIndex);
  ctx.data({
    resources: currentItems,
    total: pageTotal
  });
});

/**
 * @description: 获取上传配置
 * @param {*}
 * @return {*}
 */
router.post('/config', async (ctx) => {
  const res = await uploader.getUploadToken();
  if (res) {
    ctx.data({
      data: res
    });
  }
});
/**
 * @description 获取内容云视频地址
 */
router.get('/folders/getUrl/:id', async (ctx) => {
  const {
    params: { id }
  } = ctx;
  const key = 'AXOKIYSB';
  const path = '/contentapi/video/getVideoUrls';
  const timestamp = Date.now();
  const Nonce = uuid.v4().replace(/-/g, '');
  const AppSecret = 'db93b3152ae76fb670eb264e58ff63cc';
  const hash = crypto.createHash('sha256');
  hash.update(`${key}-${path}-${timestamp}-${Nonce}-${AppSecret}`);
  const Signature = hash.digest('hex').toUpperCase();
  const base_url = 'https://apigateway.jiaoyanyun.com';
  const confInfo = await request(
    `${base_url}${path}?extraData=eyJ1c2VyIjp7InVzZXJOYW1lIjoi5ZOI5ZOI5ZOIIiwidXNlcklkIjoiMTAwODYifX0`,
    {
      body: JSON.stringify({
        videoIdList: [id],
        extraData: {}
      }),
      method: 'post',
      headers: {
        'X-Api-Signature': Signature,
        'X-Api-Key': key,
        'Content-Type': 'application/json',
        'X-Api-Timestamp': timestamp,
        'X-Api-Nonce': Nonce
      }
    }
  );
  const body = JSON.parse(confInfo.toJSON().body);
  ctx.data(body);
});

module.exports = router;
