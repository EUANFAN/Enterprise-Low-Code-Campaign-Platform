import React from 'react';
import classNames from 'classnames';
import './Arrow.less';

export default class TabBar extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', 'arrow-icon', classNameInProps]);

    return (
      <svg
        {...others}
        className={className}
        viewBox="0 0 1024 1024"
        version="1"
      >
        <defs>
          <style type="text/css" />
        </defs>
        <path
          d="M305.149 423.383v177.326c0 17.6-14.4 32-32 32H95.823c-17.6 0-32-14.4-32-32V423.383c0-17.6 14.4-32 32-32h177.326c17.6 0 32 14.4 32 32zM632.663 423.383v177.326c0 17.6-14.4 32-32 32H423.337c-17.6 0-32-14.4-32-32V423.383c0-17.6 14.4-32 32-32h177.326c17.6 0 32 14.4 32 32zM960.177 423.383v177.326c0 17.6-14.4 32-32 32H750.851c-17.6 0-32-14.4-32-32V423.383c0-17.6 14.4-32 32-32h177.326c17.6 0 32 14.4 32 32z"
          p-id="6885"
        />
      </svg>
    );
  }
}
