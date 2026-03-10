import React from 'react';
import classNames from 'classnames';

export default class DownLoad extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg {...others} className={className} viewBox="0 0 18 18" version="1">
        <path
          d="M9.64 11.251V.656C9.64.294 9.362 0 9.02 0c-.342 0-.62.294-.62.656v10.595L5.216 7.88a.596.596 0 0 0-.877 0 .684.684 0 0 0 0 .928l3.535 3.743a1.557 1.557 0 0 0 2.292 0L13.7 8.81a.684.684 0 0 0 0-.928.596.596 0 0 0-.877 0l-3.184 3.371h.001zm7.12 1.47l1.24-.006v3.167c0 1.17-.895 2.118-2 2.118H2c-1.105 0-2-.948-2-2.118v-3.1h1.24v3.1c0 .445.34.805.76.805h14c.42 0 .76-.36.76-.805v-3.161zm1.24-.006v3.167c0 1.17-.895 2.118-2 2.118H2c-1.105 0-2-.948-2-2.118v-3.1c.062-.43.269-.648.62-.65.351-.002.558.214.62.65v3.1c0 .445.34.805.76.805h14c.42 0 .76-.36.76-.805v-3.161c.033-.428.233-.643.599-.646.365-.001.58.212.641.64z"
          fillRule="nonzero"
        />
      </svg>
    );
  }
}
