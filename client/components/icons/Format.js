import React from 'react';
import classNames from 'classnames';

export default class Format extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg
        {...others}
        className={className}
        t="1632282736864"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        p-id="2385"
      >
        <path
          d="M725.312 85.312c44.416 0 80.832 33.856 84.992 77.12l0.384 8.256v42.624H896a42.496 42.496 0 0 1 42.048 35.776l0.576 6.912v256a42.688 42.688 0 0 1-36.352 42.24L896 554.688H490.688v54.08c22.912 13.248 39.104 36.928 42.112 64.576l0.512 9.344v170.624a85.312 85.312 0 0 1-170.24 8.256l-0.448-8.256v-170.624c0-28.48 13.952-53.632 35.328-69.12l7.36-4.8V512a42.624 42.624 0 0 1 35.776-42.112L448 469.312h405.312V298.624h-42.624v42.688c0 44.416-33.856 80.768-77.12 84.928l-8.256 0.384H170.688a85.312 85.312 0 0 1-84.992-77.056l-0.384-8.256V170.688c0-44.416 33.856-80.832 77.12-84.992l8.256-0.384h554.624z m0 85.376H170.688v170.688h554.624V170.688z"
          p-id="2386"
        ></path>
      </svg>
    );
  }
}