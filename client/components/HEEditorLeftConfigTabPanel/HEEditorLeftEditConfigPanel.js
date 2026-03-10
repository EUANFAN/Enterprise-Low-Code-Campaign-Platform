import React from 'react';
import classNames from 'classnames';
import HELoadingString from 'components/HELoadingString';
import HEProjectPosterImage from 'components/HEProjectPoster/HEProjectPosterImage';
import { connectToStore } from 'components/StoreContext';
import { scrollToWidget } from 'common/getHeight';
const PanelListItemSize = {
  WIDTH: 195,
  HEIGHT: 314,
};

const PanelListItem = (props) => {
  const {
    selected,
    onSelect,
    loading,
    titleElement,
    customStore,
    project,
    page,
  } = props;
  let className = classNames(['editor-left-tab__poster-list__item'], {
    'editor-left-tab__poster-list__item--selected': selected,
    'editor-left-tab__poster-list__item--loading': loading,
  });

  return (
    <div className={className} onClick={onSelect}>
      {!loading && (
        <HEProjectPosterImage
          width={PanelListItemSize.WIDTH}
          height={PanelListItemSize.HEIGHT}
          project={project}
          page={page}
          customStore={customStore}
        />
      )}
      <div className="editor-left-tab__poster-list__item__footer">
        {loading ? (
          <div className="editor-left-tab__poster-list__item__footer__loading">
            <HELoadingString />
          </div>
        ) : (
          titleElement
        )}
      </div>
    </div>
  );
};

class HEEditorLeftEditConfigPanel extends React.Component {
  state = {
    currentLayerId: null,
  };
  componentDidMount() {
    const { store } = this.props;
    // const stageStore = store.getStageStore();
    // stageStore.toggleProfessionalFlag(false);
    const project = store.getProject();

    project.pages.forEach((page) => {
      page.widgets.forEach((widget) => {
        widget.modify({ locked: true });
      });
    });
  }
  _handlePageSelect = (layer, id, pageId) => {
    const { store } = this.props;
    // 去除页面的概念 只展示模板
    let stageStore = store.getStageStore();
    let stage = stageStore.getCurrentStage();
    const project = store.getProject();
    const editConfigState = project.editConfigState;
    if (!editConfigState || Object.keys(editConfigState).length == 0) {
      return;
    }

    const page = project.pages.find((page) => page.id === pageId);
    if (page.pageSelected) {
      stage.selectChildren(id);
    } else {
      store.getStageStore().clearCurrentStage();
      store.getStageStore().setCurrentStage(page, 'page');
      stageStore = store.getStageStore();
      stage = stageStore.getCurrentStage();
      stage.selectChildren(id);
    }
    this.setState({ currentLayerId: id });
    setTimeout(function () {
      let selectChildren = stage.getSelectedChildren()[0];
      scrollToWidget(stage, selectChildren);
    }, 100);
  };
  _renderPages = () => {
    const { store } = this.props;
    const { currentLayerId } = this.state;
    const project = store.getProject();
    const editConfigState = project.editConfigState;
    let list = [];
    project.pages.forEach((page) => {
      list = list.concat(this.getEditConfigList(page, editConfigState) || []);
    });
    if (list.length == 0) {
      list.push({
        layer: project.pages[0],
        id: project.pages[0].id,
        pageId: project.pages[0].id,
      });
    }
    // 处理配置容器
    // titleElement={<span>{layer.name}</span>}
    return (
      <div className="editor-left-tab__poster-list">
        <div className="editor-left-tab__poster-list__box">
          {list.map((item, index) => {
            const { layer, id, pageId } = item;
            return (
              <PanelListItem
                key={id || index}
                selected={currentLayerId == id}
                itemId={layer.id}
                page={layer}
                customStore={false}
                project={project}
                onSelect={() => this._handlePageSelect(layer, id, pageId)}
                titleElement={<span>{}</span>}
              />
            );
          })}
        </div>
      </div>
    );
  };
  getEditConfigList(page, editConfigState) {
    // 获取已配置的图层的列表

    let arr = [];
    let path = [];
    if (!editConfigState) return [];
    page.widgets.forEach((item) => {
      Object.keys(editConfigState).forEach((key) => {
        if (item.path == editConfigState[key] && path.indexOf(item.path) < 0) {
          if (item.layers && item.layers.length > 0) {
            arr.push({ layer: item.layers[0], id: item.id, pageId: page.id });
          } else {
            let layer = { widgets: [] };
            layer.id = page.id;
            layer.widgets.push(item);
            arr.push({ layer: layer, id: item.id, pageId: page.id });
          }

          path.push(item.path);
        }
      });
    });
    return arr;
  }
  render() {
    return <>{this._renderPages()}</>;
  }
}
export default connectToStore(HEEditorLeftEditConfigPanel);
