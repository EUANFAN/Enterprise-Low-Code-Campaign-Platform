import React from 'react';
import classNames from 'classnames';
import './Arrow.less';

export default class Trashcan extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', 'arrow-icon', classNameInProps]);

    return (
      <svg {...others} className={className} viewBox="0 0 6 11" version="1">
        <path
          d="M4.8995 5.15686L.8033 9.25305c-.19526.19526-.19526.51184 0 .7071.19526.19527.51185.19527.7071 0l4.24265-4.24264c.1516-.1516.1855-.37635.10168-.56066.08382-.1843.04992-.40905-.10168-.56065L1.5104.35356C1.31514.15829.99856.15829.8033.35356c-.19526.19526-.19526.51184 0 .7071l4.0962 4.0962z"
          fillRule="evenodd"
        />
      </svg>
    );
  }
}
