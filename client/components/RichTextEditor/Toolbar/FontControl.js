import React from 'react';
import { Input, Select } from 'antd';
const { Option } = Select;
const { Group } = Input;

export default class FontControl extends React.Component {
  render() {
    const {
      onFontFamilyChange,
      onFontWeightChange,
      fonts,
      fontFamily,
      fontWeight,
    } = this.props;

    const selectedFontFamilyWeights = fonts[fontFamily].weights;

    return (
      <Group compact size="small" style={{ width: 'auto' }}>
        <Select size="small" onChange={onFontFamilyChange} value={fontFamily}>
          {Object.keys(fonts).map((fontFamily) => {
            const fontInfo = fonts[fontFamily];

            return (
              <Option key={fontFamily} value={fontFamily}>
                {fontInfo.name}
              </Option>
            );
          })}
        </Select>
        <Select size="small" onChange={onFontWeightChange} value={fontWeight}>
          {Object.keys(selectedFontFamilyWeights).map((weight) => {
            const weightInfo = selectedFontFamilyWeights[weight];

            return (
              <Option key={weight} value={weight}>
                {weightInfo.name}
              </Option>
            );
          })}
        </Select>
      </Group>
    );
  }
}
