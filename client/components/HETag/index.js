import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import './index.less';

const HETag = (props) => {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState('');

  const handleChange = (item) => {
    if (item._id == selected) return;
    setSelected(item._id || '');
    props.onChange && props.onChange(item);
  };
  useEffect(() => {
    if (props.list && props.list.length > 0) {
      setList([{ name: '全部', _id: 'all' }].concat(props.list));
      setSelected('all');
    }
  }, []);
  useEffect(() => {
    if (props.defaultValue && props.defaultValue._id) {
      let findItem = list.find((item) => item._id == props.defaultValue._id);
      findItem && handleChange(findItem);
    }
  }, [props.defaultValue, list]);
  return (
    <ul className="tag-list-wrapper">
      {list.length > 0 &&
        list.map((item) => (
          <li
            key={item._id}
            className={classNames([
              'tag-list-item',
              { 'tag-list-item-active': item._id === selected },
            ])}
            onClick={() => handleChange(item)}
          >
            {item.name}
          </li>
        ))}
    </ul>
  );
};

export default HETag;
