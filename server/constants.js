const VALID_UPLOAD_EXTENSIONS = [
  // Images
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',

  // Audio
  '.mp3',
  '.wav',

  // Video
  '.mp4',

  // Fonts
  '.ttf',
  '.otf',
  '.woff',
  '.woff2',

  // Texts
  '.html',
  '.css',
  '.js',

  // File
  '.doc',
  '.docx',
  '.pdf',
  '.xls',
  '.xlsx',
  '.txt',
  '.csv',
  // Application gzip
  '.zip',
  '.tar',
  '.gzip',
  '.gz',
];

const ErrorNumbers = {
  UNCATCHED_ERROR: 9000,
  AUTHENTICATINO_FAILED: 4000,
  PERMISION_DENIED: 3000,
  INVALID_UPLAOD_EXTENSION: 2000,
  INVALID_PARAMETER: 1000,
};
const ErrorMessages = {
  INVALID_UPLAOD_EXTENSION: '不是合法的副档名',
};
const DEFAULT_PAGE_SIZE = 20;

const UserPublicFields = ['userId'];

const ThemeTypes = [
  { name: '运营位资源编辑', type: 'operations' },
  { name: '落地页', type: '' },
  { name: '渠道红包', type: '' },
  { name: '运营中台', type: '' },
];

const HomeSecondaryPageCategories = {
  POPULAR: 'popular',
  THEME: 'theme',
  FREE: 'free',
};

const FileTypes = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  FILE: 'file',
  OTHERS: 'others',
};
const ThemeGroupTypes = {
  MODAL: 'modal',
  BRAND_BANNER: 'brandBanner',
  NORMAL: 'normal',
};

const DEFAULT_POSTER = '//m.xiwang.com/resource/poster-1655691287397.png';

const DAY_HOURS = [
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
];

const AUDIT_STATUS = {
  NO_AUDIT: 0, // 未审核
  AUDITING: 1, // 审核中
  AUDIT_SUCCESS: 2, // 审核通过
  AUDIT_REJECT: 3, // 审核不通过
};

module.exports = {
  UserPublicFields,
  ErrorNumbers,
  ThemeTypes,
  DEFAULT_PAGE_SIZE,
  VALID_UPLOAD_EXTENSIONS,
  HomeSecondaryPageCategories,
  ErrorMessages,
  ThemeGroupTypes,
  FileTypes,
  URL_SEPARATOR: '/',
  QUERY_SEPARATOR: '+',
  DEFAULT_POSTER,
  DAY_HOURS,
  AUDIT_STATUS,
};
