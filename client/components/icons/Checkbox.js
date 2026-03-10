import React from 'react';
import classNames from 'classnames';

export default class Checkbox extends React.Component {
  render() {
    const { className: classNameInProps, checked, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg
        {...others}
        className={className}
        viewBox="0 0 50 50"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        {checked ? (
          <React.Fragment>
            <defs>
              <rect id="b" width="30" height="30" />
              <filter
                width="213.3%"
                height="213.3%"
                filterUnits="objectBoundingBox"
                id="a"
              >
                <feOffset dy="4" in="SourceAlpha" result="shadowOffsetOuter1" />
                <feGaussianBlur
                  stdDeviation="5"
                  in="shadowOffsetOuter1"
                  result="shadowBlurOuter1"
                />
                <feColorMatrix
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.101647418 0"
                  in="shadowBlurOuter1"
                />
              </filter>
            </defs>
            <g fill="none" fillRule="evenodd">
              <g transform="translate(10 6)">
                <use fill="#000" filter="url(#a)" xlinkHref="#b" />
                {/* <use fill="#4A82F7" xlinkHref="#b" /> */}
                <rect
                  stroke="#4A82F7"
                  strokeLinejoin="square"
                  fill="#4A82F7"
                  width="29"
                  height="29"
                />
              </g>
              <path
                d="M23.15 27c-.31 0-.63-.12-.87-.36l-4.92-4.89a1.22 1.22 0 0 1 0-1.73 1.24 1.24 0 0 1 1.74 0l4.05 4.03 7.75-7.7a1.23 1.23 0 0 1 1.74 0c.48.49.48 1.26 0 1.74l-8.62 8.55c-.24.24-.55.36-.87.36z"
                fill="#FFF"
                fillRule="nonzero"
              />
            </g>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <defs>
              <rect id="b" width="30" height="30" rx="15" />
              <filter
                x="-56.7%"
                y="-43.3%"
                width="213.3%"
                height="213.3%"
                filterUnits="objectBoundingBox"
                id="a"
              >
                <feOffset dy="4" in="SourceAlpha" result="shadowOffsetOuter1" />
                <feGaussianBlur
                  stdDeviation="5"
                  in="shadowOffsetOuter1"
                  result="shadowBlurOuter1"
                />
                <feComposite
                  in="shadowBlurOuter1"
                  in2="SourceAlpha"
                  operator="out"
                  result="shadowBlurOuter1"
                />
                <feColorMatrix
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.101647418 0"
                  in="shadowBlurOuter1"
                />
              </filter>
            </defs>
            <g transform="translate(10 6)" fill="none" fillRule="evenodd">
              <use fill="#000" filter="url(#a)" xlinkHref="#b" />
              <rect
                stroke="#4A82F7"
                strokeLinejoin="square"
                fill="#FFF"
                width="29"
                height="29"
              />
            </g>
          </React.Fragment>
        )}
      </svg>
    );
  }
}
