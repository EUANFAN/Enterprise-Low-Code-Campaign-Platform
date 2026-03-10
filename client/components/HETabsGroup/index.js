import React from 'react';
import { Tab, TabPanel, TabList, Tabs } from 'react-tabs';
import classNames from 'classnames';
import './index.less';
export default class HETabsGroup extends React.Component {
  _tabRef = null;
  _indicatorRef = React.createRef();
  _tabRects = null;
  state = {
    showTipFlag: false,
  };
  componentDidMount() {
    const domList = this._tabRef.querySelectorAll('.he-tabs-group__item');
    this._tabRects = Array.from(domList).map((dom) =>
      dom.getBoundingClientRect()
    );
  }
  showTip(flag) {
    this.setState({
      showTipFlag: flag,
    });
  }
  render() {
    const {
      className: classNameFromProps,
      tabListClass: tabListClassFromProps,
      panelClass: tabPanelClassFromProps,
      tabAnimateClass: tabAnimateClassFromProps,
      children,
      tabIndex,
      onChange,
    } = this.props;
    const childrenArray = React.Children.toArray(children);
    const className = classNames(['he-tabs-group', classNameFromProps]);
    const tabListClass = classNames([
      'he-tabs-group__list',
      tabListClassFromProps,
    ]);
    const tabPanelClass = classNames([
      'he-tabs-group__panel',
      tabPanelClassFromProps,
    ]);
    const tabAnimateClass = classNames('he-tabs-group__box', {
      'he-tabs-group__box--selected': tabAnimateClassFromProps,
    });
    return (
      <Tabs
        domRef={(element) => {
          this._tabRef = element;
        }}
        selectedIndex={tabIndex}
        className={className}
        onSelect={onChange}
      >
        <TabList className={tabListClass}>
          {childrenArray.map((element, index) => {
            const { title } = element.props;
            return (
              <Tab
                key={title}
                className="he-tabs-group__list__item"
                selectedClassName="he-tabs-group__list__item--selected"
                tabIndex={`${index}`}
              >
                {title}
              </Tab>
            );
          })}
        </TabList>
        <div className={tabAnimateClass}>
          {childrenArray.map((element) => (
            <TabPanel
              key={element.props.title}
              className={tabPanelClass}
              selectedClassName="he-tabs-group__panel--selected"
            >
              {element}
            </TabPanel>
          ))}
        </div>
      </Tabs>
    );
  }
}
