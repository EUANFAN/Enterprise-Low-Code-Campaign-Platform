import React from 'react';
import classNames from 'classnames';

const DEFAULT_COLOR = '#d6d6d6';

export default class Search extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const { className: classNameInProps, fill, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg
        {...others}
        className={className}
        viewBox="0 0 16 16"
        fill={fill || DEFAULT_COLOR}
        version="1"
      >
        <path
          d="M15.85 15.08l-3.2-3.23c2.58-3 2.25-7.53-.76-10.11a7.2 7.2 0 0 0-10.15.75c-2.59 3-2.25 7.53.76 10.12a7.2 7.2 0 0 0 9.39 0l3.16 3.22c.21.22.56.23.78.02.22-.2.23-.56.02-.77zM1.12 7.19a6.1 6.1 0 1 1 6.1 6.09 6.1 6.1 0 0 1-6.1-6.09z"
          fillRule="nonzero"
        />
      </svg>
    );
  }
}
