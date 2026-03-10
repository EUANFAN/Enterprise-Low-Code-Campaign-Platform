import React from 'react';
import classNames from 'classnames';

export default class Test extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);
    return (
      <svg
        {...others}
        className={className}
        viewBox="0 0 1063 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="7679"
        width="24"
        height="24"
      >
        <path
          d="M742.004442 547.368485L274.510136 779.894717a39.384524 39.384524 0 0 1-54.902027-47.773428L285.143957 536.419587a76.642285 76.642285 0 0 0 0-48.679273L219.608109 292.077997a39.384524 39.384524 0 0 1 54.862642-47.773428l467.494306 232.526232a39.384524 39.384524 0 0 1 0 70.498299zM161.279628 1008.403728l859.370324-427.440244A76.996745 76.996745 0 0 0 1063.382161 512.079951c0-29.144548-16.5415-55.807871-42.732209-68.844149L161.358397 15.716788C61.046013-34.262173-27.490398 41.67119 8.073828 147.418638l121.934487 364.700697L7.876905 876.623109c-35.249149 105.392988 53.484184 181.483889 153.442107 131.741235z"
          p-id="7680"
          fill="#4A82F7"
        ></path>
      </svg>
    );
  }
}
