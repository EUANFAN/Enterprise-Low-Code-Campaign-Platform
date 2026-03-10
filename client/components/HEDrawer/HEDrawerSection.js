/*
 * @Author: your name
 * @Date: 2020-02-14 19:53:11
 * @LastEditTime: 2021-08-16 20:03:18
 * @LastEditors: jielang
 * @Description: In User Settings Edit
 * @FilePath: /x-core/client/components/HEDrawer/HEDrawerSection.js
 */
import React from 'react';
import classNames from 'classnames';

import './HEDrawerSection.less';

// function Title(props) {
//   return <div className="he-drawer-section__title__text">{props.children}</div>;
// }

export default class HEDrawerSection extends React.Component {
  static defaultProps = {
    className: '',
    title: '',
  };

  render() {
    const {
      className: classNameFromProp,
      children,
      // title,
      // loading,
    } = this.props;
    const className = classNames(['he-drawer-section', classNameFromProp]);
    return (
      <div className={className}>
        {/* {
          (title || loading) && (
            <div className={'he-drawer-section__title'}>
              {
                loading ?
                  (<HELoadingString className='he-drawer-section__title__text' />) :
                  (<Title>{title}</Title>)
              }
            </div>
          )
        } */}
        <div className="he-drawer-section-content">{children}</div>
      </div>
    );
  }
}
