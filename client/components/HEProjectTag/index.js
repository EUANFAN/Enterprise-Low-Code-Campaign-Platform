import React from 'react';
import { Select, Tag } from 'antd';
import { getProjectTagList } from 'apis/TagAPI';

const { Option } = Select;

function tagRender(props) {
  const { label, value, closable, onClose } = props;
  return (
    <Tag
      color={value}
      closable={closable}
      onClose={onClose}
      style={{ marginRight: 3 }}
    >
      {label}
    </Tag>
  );
}

export default class HEProjectTag extends React.Component {
  state = {
    tagList: [],
    selectedTag: []
  };

  async UNSAFE_componentWillMount() {
    const { list } = await getProjectTagList();

    this.setState({
      tagList: [...list]
    });
  }

  render() {
    const { tagList } = this.state;
    const { value, onSelect, width } = this.props;

    return (
      <Select
        mode="multiple"
        allowClear
        tagRender={tagRender}
        style={{ width: width || '280px' }}
        dropdownStyle={{ textAlign: 'left' }}
        placeholder="请选择项目标签"
        defaultValue={value}
        getPopupContainer={(triggerNode) => triggerNode.parentNode}
        onChange={onSelect}
      >
        {tagList &&
          tagList.map((item) => <Option key={item._id}>{item.name}</Option>)}
      </Select>
    );
  }
}
