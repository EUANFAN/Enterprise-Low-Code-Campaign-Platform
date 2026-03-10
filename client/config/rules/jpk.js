// 年级列表
const gradeList = [
  { text: '小班', value: '24' },
  { text: '中班', value: '25' },
  { text: '大班', value: '1' },
  { text: '一年级', value: '2' },
  { text: '二年级', value: '3' },
  { text: '三年级', value: '4' },
  { text: '四年级', value: '5' },
  { text: '五年级', value: '6' },
  { text: '六年级', value: '7' },
  { text: '预初', value: '26' },
  { text: '初一', value: '8' },
  { text: '初二', value: '9' },
  { text: '初三', value: '10' },
  { text: '高一', value: '11' },
  { text: '高二', value: '12' },
  { text: '高三', value: '13' }
]
let type1 = ''
const getNewOptions = async ({ ctx, name, type1Id, type2Id }) => {
  if (type1Id) {
    type1 = type1Id
  }
  const res = await ctx.get(
    'https://booster.xueersi.com/optimumCourseN/courseFilterList',
    { type1Id: type1, _canche: true }
  )
  if (res.code != 0) {
    return []
  }

  let courseFilter = res.data.info.courseFilter
  let options = []
  if (name == 'course_type2') {
    options = courseFilter.course_type
      ? courseFilter.course_type.child.slice()
      : []
  } else if (
    name == 'year' ||
    name == 'term' ||
    name == 'subject' ||
    name == 'grade'
  ) {
    options = courseFilter[name].slice()
  } else if (name == 'course_type3') {
    let courseType2 = courseFilter.course_type
      ? courseFilter.course_type.child.slice()
      : []
    courseType2.forEach((item) => {
      if (item.id == type2Id) {
        options = item.child.slice()
      }
    })
  }
  let newOptions = []

  options.forEach((item) => {
    let tip = name != 'subject' ? '(' + item.id + ')' : ''
    newOptions.push({
      value: Number(item.id),
      text: item.name + tip
    })
  })
  const sortSmallToBig = (a, b) => {
    return Number(a.value) - Number(b.value)
  }
  newOptions.sort(sortSmallToBig)
  return newOptions
}

const getCourseType1 = async (ctx) => {
  const res = await ctx.get(
    'https://booster.xueersi.com/structure/getConfInfo?key=jpkCourseType1'
  )
  if (res.code != 0) {
    return []
  }
  return res.data.jsonData.data
}
const validate = (value) => {
  if (!value) {
    return { stat: false, msg: '此项是必填项' }
  }
  if (isNaN(Number(value)) || Number(value) < 0) {
    return { stat: false, msg: '请填写数字' }
  }
  return { stat: true, msg: '' }
}

const validateSelect = (value) => {
  if (!value) {
    return { stat: false, msg: '此项是必填项' }
  }
  if (isNaN(Number(value)) || Number(value) <= 0) {
    return { stat: false, msg: '请选择' }
  }
  return { stat: true, msg: '' }
}
const validateNameLength = (value) => {
  const len = value.length
  if (!value) {
    return { stat: false, msg: '此项是必填项' }
  }
  if (len > 4) {
    return { stat: false, msg: '名称不能超过4个汉字' }
  }
  return { stat: true, msg: '' }
}

export default {
  data: {
    sGroupId: '',
    actualPrice: null,
    pageHeadImgList: [
      {
        img: '',
        type: '1',
        videoSrc: '',
        videoPoster: ''
      }
    ],
    pageDetailImg: [
      {
        img: '',
        type: '1',
        videoSrc: '',
        videoPoster: ''
      }
    ],
    courseStartTime: null,
    courseType1: '', // 课程类型1
    courseType2: '', // 课程类型2
    courseType3: '', // 课程类型3
    gradeIds: '', // 年级id
    subjectIds: '', // 学科id
    isMore: false,
    projectName: '', // 主tab名称
    children: [
      // 课程组
      {
        projectName: '',
        courseType1: '', // 课程类型1
        courseType2: '', // 课程类型2
        courseType3: '', // 课程类型3
        gradeIds: '', // 年级id
        subjectIds: '', // 学科id,
        sGroupId: ''
      }
    ]
  },
  config: {
    sGroupId: {
      text: '新精品课购买资格编号',
      type: 'NormalText',
      msg: '用户购买资格编号',
      require: true,
      value: ''
    },
    actualPrice: {
      text: '课程售价',
      type: 'NormalText',
      require: true,
      value: null,
      validate
    },
    pageHeadImgList: {
      text: '头部素材配置',
      msg: '年级上方展示',
      type: 'AssembleList',
      minCount: 1,
      maxCount: 100,
      require: true,
      noDragSort: false,
      itemTitle: '头部配置素材',
      fields: {
        type: {
          text: '头部素材类型',
          type: 'Radio',
          require: true,
          value: '1',
          options: [
            { text: '图片', value: '1' },
            { text: '视频', value: '2' }
          ]
        },
        img: {
          type: 'FilePicker',
          controlParams: {
            type: 'Image'
          },
          text: '素材图',
          require: true,
          value: '',
          when(data) {
            return data.type == '1'
          }
        },
        videoPoster: {
          type: 'FilePicker',
          controlParams: {
            type: 'Image'
          },
          text: '视频封面图',
          require: true,
          value: '',
          when(data) {
            return data.type == '2'
          }
        },
        videoSrc: {
          type: 'NormalText',
          text: '视频链接',
          value: '',
          require: true,
          when(data) {
            return data.type == '2'
          }
        }
      }
    },
    pageDetailImg: {
      text: '尾部素材图配置',
      type: 'AssembleList',
      minCount: 1,
      maxCount: 100,
      require: true,
      noDragSort: false,
      itemTitle: '尾部配置素材',
      fields: {
        type: {
          text: '尾部素材类型',
          type: 'Radio',
          require: true,
          value: '1',
          options: [
            { text: '图片', value: '1' },
            { text: '视频', value: '2' }
          ]
        },
        img: {
          type: 'FilePicker',
          controlParams: {
            type: 'Image'
          },
          text: '素材图',
          require: true,
          value: '',
          when(data) {
            return data.type == '1'
          }
        },
        videoPoster: {
          type: 'FilePicker',
          controlParams: {
            type: 'Image'
          },
          text: '视频封面图',
          require: true,
          value: '',
          when(data) {
            return data.type == '2'
          }
        },
        videoSrc: {
          type: 'NormalText',
          text: '视频链接',
          value: '',
          require: true,
          when(data) {
            return data.type == '2'
          }
        }
      }
    },
    projectName: {
      text: '名称',
      msg: '最多不超过4个汉字',
      type: 'NormalText',
      value: '',
      // require: true,
      validate: validateNameLength
    },
    courseType1: {
      text: '课程类型一',
      type: 'Select',
      value: -1,
      require: true,
      async options(ctx) {
        let options = await getCourseType1(ctx)
        return options
      },
      validate: validateSelect
    },
    courseType2: {
      text: '课程类型二',
      type: 'Select',
      value: -1,
      cascade: 'courseType1',
      require: true,
      async options(ctx, parent) {
        let options = await getNewOptions({
          ctx,
          name: 'course_type2',
          type1Id: parent
        })
        return options
      },
      validate: validateSelect
    },
    courseType3: {
      text: '课程类型三',
      type: 'Select',
      value: 0,
      cascade: 'courseType2',
      require: false,
      async options(ctx, parent) {
        let options = await getNewOptions({
          ctx,
          name: 'course_type3',
          type2Id: parent
        })
        options.push({ value: '0', text: '无' })
        return options
      }
    },
    gradeIds: {
      text: '年级选择',
      type: 'Select',
      value: '24',
      require: true,
      options: gradeList
    },
    subjectIds: {
      text: '科目选择',
      type: 'Select',
      value: 2,
      require: true,
      cascade: 'courseType1',
      async options(ctx, parent) {
        let options = await getNewOptions({
          ctx,
          name: 'subject',
          type1Id: parent
        })
        return options
      },
      validate: validateSelect
    },
    courseStartTime: {
      text: 'x天内课程',
      msg: '当前距离最近开课时间天数',
      type: 'NormalText',
      value: null,
      require: true,
      validate
    },

    isMore: {
      text: '是否添加课程组配置',
      type: 'Radio',
      value: false,
      options: [
        { text: '是', value: true },
        { text: '否', value: false }
      ]
    },

    children: {
      text: '添加课程组配置 ',
      type: 'AssembleList',
      minCount: 1,
      noDragSort: true,
      require: true,
      itemTitle: '课程组',
      fields: {
        sGroupId: {
          text: '新精品课购买资格编号',
          type: 'NormalText',
          msg: '用户购买资格编号',
          value: ''
        },
        projectName: {
          text: '名称',
          msg: '最多不超过4个汉字',
          type: 'NormalText',
          value: '',
          require: true,
          validate: validateNameLength
        },
        courseType1: {
          text: '课程类型一',
          type: 'Select',
          require: true,
          options: async (ctx) => {
            let options = await getCourseType1(ctx)
            return options
          },
          validate: validateSelect
        },
        courseType2: {
          text: '课程类型二',
          type: 'Select',
          cascade: 'courseType1',
          require: true,
          async options(ctx, parent) {
            let options = await getNewOptions({
              ctx,
              name: 'course_type2',
              type1Id: parent
            })
            return options
          },
          validate: validateSelect
        },
        courseType3: {
          text: '课程类型三',
          type: 'Select',
          value: '',
          cascade: 'courseType2',
          require: false,
          async options(ctx, parent) {
            let options = await getNewOptions({
              ctx,
              name: 'course_type3',
              type2Id: parent
            })
            options.push({ value: '0', text: '无' })
            return options
          }
        },
        gradeIds: {
          text: '年级选择',
          type: 'Select',
          value: '24',
          require: true,
          options: gradeList
        },
        subjectIds: {
          text: '科目选择',
          type: 'Select',
          // value: 2,
          require: true,
          cascade: 'courseType1',
          async options(ctx, parent) {
            let options = await getNewOptions({
              ctx,
              name: 'subject',
              type1Id: parent
            })
            return options
          },
          validate: validateSelect
        },
        courseStartTime: {
          text: 'x天内课程',
          msg: '当前距离最近开课时间天数',
          type: 'NormalText',
          value: null,
          require: true,
          validate
        }
      },
      when(widget, project) {
        const { rulesConfig } = project
        return rulesConfig.isMore
      }
    }
  }
}
