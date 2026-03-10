import React from 'react';

import HEProjectPoster from 'components/HEProjectPoster';
import HEButton, { HEButtonSizes } from 'components/HEButton';
import { HECard, HECardContent, HECardActions } from 'components/HECard';
import { HEHiddenButton, HEHiddenButtonGroup } from 'components/HEHiddenButton';

import './index.less';

const PosterImageSize = {
  WIDTH: 160,
  HEIGHT: 240,
};

export default class ThemePoster extends React.Component {
  render() {
    const {
      loading,
      themeData,
      title,
      editMode,
      canCopy,
      onOpen,
      onShowInfo,
      onDelete,
      onCopy,
    } = this.props;
    return (
      <HECard className="h5-theme-resource__container__content__poster">
        <div className="h5-theme-resource__container__content__poster__main">
          <HECardContent>
            <HEProjectPoster
              loading={loading}
              title={title}
              themeData={themeData}
              onClick={onOpen}
              width={PosterImageSize.WIDTH}
              height={PosterImageSize.HEIGHT}
              showPoster={true}
            />
          </HECardContent>
        </div>
        {editMode && (
          <HECardActions className="h5-theme-resource__container__content__poster__actions">
            <HEHiddenButtonGroup className="h5-theme-resource__container__content__poster__actions__button-groups">
              <HEHiddenButton onClick={onShowInfo}>{'信息'}</HEHiddenButton>
              {canCopy && (
                <HEHiddenButton onClick={onCopy}>{'复制'}</HEHiddenButton>
              )}
              <HEHiddenButton onClick={onDelete}>{'删除'}</HEHiddenButton>
            </HEHiddenButtonGroup>
            <HEButton
              className="h5-theme-resource__container__content__poster__actions__main-button"
              onClick={onOpen}
              sizeType={HEButtonSizes.SMALL}
              outline={true}
            >
              {'打开'}
            </HEButton>
          </HECardActions>
        )}
      </HECard>
    );
  }
}
