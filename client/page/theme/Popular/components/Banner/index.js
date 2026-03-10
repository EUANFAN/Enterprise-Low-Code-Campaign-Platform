import React from 'react';
import { useObserver } from 'mobx-react-lite';
import { Carousel } from 'antd';

import './index.less';
import useHomeStore from 'hook/useHomeStore';

const Banner = () => {
  const store = useHomeStore();
  return useObserver(() => (
    <div className="banner-wrapper">
      {store.config.bannerList.length > 0 && <Carousel autoplay>
        {store.config.bannerList.length > 0 &&
          store.config.bannerList.map((item, index) => (
            <img
              key={index}
              src={item.img}
              className={item.url ? 'banner-item-cursor' : ''}
              onClick={() => {
                item.url && (location.href = item.url);
              }}
            ></img>
          ))}
      </Carousel>}
    </div>
  ));
};
export default Banner;
