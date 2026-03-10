import React from 'react'
import Text from 'components/icons/Text'
import Image from 'components/icons/Image'
import Inbox from 'components/icons/Inbox'
import Button from 'components/icons/Button'
import Video from 'components/icons/Video';
import HotArea from 'components/icons/HotArea'
// import Data from 'components/icons/Data';

export default [
  {
    name: '文本',
    icon: <Text />,
    group: 'Text',
    isSingle: false,
    role: 'editorBaseWidgetText'
  },
  {
    name: '图片',
    icon: <Image />,
    group: 'Image',
    isSingle: true,
    widgetType: 'Image',
    role: 'editorBaseWidgetImg'
  },
  {
    name: '视频',
    icon: <Video />,
    group: 'Video',
    isSingle: true,
    widgetType: 'Video',
    role: 'editorBaseWidgetVideo'
  },
  {
    name: '按钮',
    icon: <Button />,
    group: 'Button',
    isSingle: true,
    widgetType: 'Button',
    role: 'editorBaseWidgetButton'
  },
  // TODO：暂时关闭热区入口
  {
    name: '热区',
    icon: <HotArea />,
    group: 'HotArea',
    isSingle: true,
    widgetType: 'HotArea',
    role: 'editorBaseWidgetHotArea'
  },
  {
    name: '容器',
    icon: <Inbox />,
    group: 'Container',
    isSingle: true,
    widgetType: 'Container',
    role: 'editorBaseWidgetContainer'
  }
  // {
  //   name: '音乐',
  //   icon: <Music />,
  //   group: 'Music',
  //   isSingle: true,
  //   widgetType: 'Music', // 这里选择这个原因，考虑到创建组件的时候用户需要手动加上group
  //   role: 'editorBaseMusic'
  // },

  // {
  //   name: '表单',
  //   icon: <Form />,
  //   group: 'Form',
  //   isSingle: false,
  // },
  // TODO：暂时关闭数据模板入口
  // {
  //   name: '数据模板',
  //   icon: <Data />,
  //   group: 'DataContainer',
  //   isSingle: true,
  //   widgetType: 'DataContainer',
  //   role: 'editorBaseWidgetDataContainer'
  // }
]
