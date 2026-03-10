import React from 'react';
import { noop } from 'utils/FunctionUtils';
import { ResourceSecondaryPages } from 'common/constants';
import {
  HEDrawer,
  HEDrawerSection,
  HEDrawerSectionItem,
} from 'components/HEDrawer';

const MY_RESOURCES = [
  { name: '图片', key: ResourceSecondaryPages.MY_IMAGE },
  { name: '音频', key: ResourceSecondaryPages.MY_AUDIO },
  { name: '视频', key: ResourceSecondaryPages.MY_VIDEO },
  { name: '文档', key: ResourceSecondaryPages.MY_FILE },
];

export default class ResourcesDrawer extends React.Component {
  static defaultProps = {
    onSelect: noop,
  };

  render() {
    const { selected, onSelect, className } = this.props;

    return (
      <HEDrawer className={className || null}>
        {/* <HEDrawerSection title={'官方资源'}>
          {OFFICIAL_RESOURCES.map(item =>
            <HEDrawerSectionItem
              key={item.key}
              itemKey={item.key}
              selected={selected === item.key}
              onSelect={onSelect}
            >
              {item.name}
            </HEDrawerSectionItem>
          )}
        </HEDrawerSection> */}
        <HEDrawerSection title={'我的资源库'}>
          {MY_RESOURCES.map((item) => (
            <HEDrawerSectionItem
              key={item.key}
              itemKey={item.key}
              selected={selected === item.key}
              onSelect={onSelect}
            >
              {item.name}
            </HEDrawerSectionItem>
          ))}
        </HEDrawerSection>
      </HEDrawer>
    );
  }
}
