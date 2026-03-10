import React from 'react';
import classNames from 'classnames';

export default class Import extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg
        {...others}
        className={className}
        viewBox="0 0 24 19"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.18 12.343l4.604-3.375c.265-.193.127-.613-.2-.613h-1.458a.34.34 0 0 1-.34-.34V.34A.339.339 0 0 0 12.449 0H7.466a.339.339 0 0 0-.34.339v7.677a.34.34 0 0 1-.339.34H5.34a.34.34 0 0 0-.2.612l4.64 3.376c.12.087.282.087.4 0zm7.336-5.315c.59.584.92 1.378.92 2.207v3.832a3.141 3.141 0 0 1-3.127 3.127H4.691a3.141 3.141 0 0 1-3.127-3.128V9.235c0-.83.33-1.624.92-2.207.248-.249.536-.455.852-.609V4.746C1.41 5.33 0 7.126 0 9.236v3.83c0 2.58 2.11 4.692 4.69 4.692h10.62c2.58 0 4.69-2.112 4.69-4.692V9.235c0-2.11-1.411-3.904-3.336-4.49V6.42c.316.155.604.36.852.61z"
          fillRule="nonzero"
        />
      </svg>
    );
  }
}
