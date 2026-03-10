import React from 'react';
import classNames from 'classnames';

import { HECard, HECardContent } from 'components/HECard';

import './index.less';

export default function SuggestionSection(props) {
  const className = classNames([
    'h5-home-suggestions-section',
    props.className,
  ]);
  const containerClass = classNames([
    'h5-home-suggestions-section__content-container__content',
    props.containerClass,
  ]);

  return (
    <div className={className}>
      {props.title && (
        <p className="h5-home-suggestions-section__title">{props.title}</p>
      )}
      <HECard className="h5-home-suggestions-section__content-container">
        <HECardContent className={containerClass}>
          {props.children}
        </HECardContent>
      </HECard>
    </div>
  );
}
