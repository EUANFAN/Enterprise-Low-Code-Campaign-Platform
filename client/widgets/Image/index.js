import './index.less';
import LazyLoad from '@k9/react-lazyload';
import { hasVariable } from 'utils/ModelUtils';
import { afterUpdateHook, beforeUpdateHook } from 'common/attributeHook';
import React from 'react';
import Loadable from 'react-loadable';
import { px2rem } from 'utils/ModelUtils';
import loadingComponent from 'components/LoadingComponent';
const Viewer = Loadable({
  loader: () => import(/* webpackChunkName: "ImageViewer" */ './ImageViewer'),
  loading: loadingComponent,
});
export default {
  name: '图片',
  type: 'Image',
  icon: 'picture',
  category: 'Image',
  group: 'Image',
  data: {
    url: '',
    size: {},
    visible: false,
    viewBigPic: false,
    isLoaded: false,
  },
  config: {
    url: {
      text: '图片地址',
      type: 'FilePicker',
      controlParams: {
        type: 'Image',
      },
      useData: true,
    },
    viewBigPic: {
      text: '查看大图',
      type: 'Radio',
      options: [
        {
          text: '是',
          value: true,
        },
        {
          text: '否',
          value: false,
        },
      ],
    },
  },
  methods: {
    getImageContent: function (url, widgetRef) {
      if (hasVariable(url)) {
        return (
          <div className="image-variable" ref={widgetRef}>
            <p>{url}</p>
          </div>
        );
      } else {
        return (
          <img
            className="no-lazy-load"
            src={url}
            style={{ display: 'block', width: '100%' }}
            ref={widgetRef}
            onLoad={this.onLoad.bind(this)}
          />
        );
      }
    },
    onLoad() {
      this.data.isLoaded = true;
    },
  },

  onEnter(ctx) {
    let data = ctx.widget.data;
    return new Promise((resolve) => {
      ctx.open(
        'FilePicker',
        { type: 'image' },
        async (result) => {
          const file = result.selectedFile;
          if (file.type != 'image') {
            return false;
          }
          let size = file.size || {};
          data.size = data.size || {};
          data.size.height = size.height;
          data.size.width = size.width;
          // 正常情况下
          let width_100 = ctx.containerWidth;
          // 进行缩放处理
          let { width: originWidth, height: originHeight } = size;
          let scale = width_100 / originWidth;
          ctx.widget.width = width_100;
          ctx.widget.height = Math.round(originHeight * scale);
          data.url = file.url;
          // 如果页面高度不够，就让页面高度自适应
          resolve(true);
        },
        (msg) => {
          console.log('Enter Image msg:', msg);
          resolve(false);
        }
      );
    });
  },
  onRender(ctx) {
    const {
      widget,
      project,
      widgetRef,
      getUrlParmas,
      container,
      useDataValue,
      variableMap,
      page,
    } = ctx;
    const { data } = widget;
    const url = useDataValue(data.url, variableMap, page, project) || '';
    const widgetMargin = widget.margin.split(' ');
    const imageScaling = widget.width / widget.height;
    const imgHeight =
      (widget.width - widgetMargin[1] - widgetMargin[3]) / imageScaling;
    const style = {
      height: imgHeight,
    };
    px2rem(style);
    // 如果已经加载完毕 无需设置高度
    if (data.isLoaded) {
      delete style.height;
    }

    // 只有发布页的预览url上带有isCurrentPage参数
    const isCurrentPage =
      getUrlParmas(location.href)['current_page'] === undefined ? false : true;
    return (
      // 非编辑且不在发布页的情况才实行图片懒加载
      <div className="widget-image" style={style}>
        {url &&
          !god.inEditor &&
          god.PageData &&
          god.PageData.project &&
          !isCurrentPage &&
          !project.closeImgLazyLoad &&
          !container.closeImgLazyLoad && (
            <LazyLoad height={widget.height} offset={200}>
              <img
                src={url}
                style={{ display: 'block', width: '100%' }}
                onClick={() => {
                  data.visible = true;
                }}
                onLoad={this.onLoad.bind(this)}
              />
              {data.viewBigPic && data.visible && (
                <Viewer
                  visible={data.visible}
                  onClose={() => {
                    data.visible = false;
                  }}
                  images={[{ src: url, alt: '' }]}
                />
              )}
            </LazyLoad>
          )}
        {
          // 编辑平台，个人中心，发布页的预览
          url &&
            (god.inEditor ||
              !god.PageData.project ||
              isCurrentPage ||
              project.closeImgLazyLoad ||
              container.closeImgLazyLoad) &&
            this.getImageContent(url, widgetRef, data.height)
        }
      </div>
    );
  },

  onNext(ctx) {
    let widget = ctx.widget;
    return new Promise((resolve) => {
      ctx.open(
        'FilePicker',
        { type: 'image' },
        async (result) => {
          const file = result.selectedFile;
          let computedAttribute = await beforeUpdateHook(
            widget,
            'url',
            file.url,
            'data'
          );
          await widget.modify({
            height: computedAttribute.height,
          });
          await widget.modify(
            {
              url: file.url,
            },
            'data'
          );
          afterUpdateHook(widget, 'url', 'data', 'height');
          resolve(true);
        },
        (msg) => {
          console.log('Enter Image msg:', msg);
          resolve(false);
        }
      );
    });
  },
};
