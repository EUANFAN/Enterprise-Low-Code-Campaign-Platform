import React from 'react';
import { Spin } from 'antd';
import './index.less';
import { Chart, Geom, Axis, Tooltip } from 'bizcharts';
const cols = {
  count: {
    min: 0,
    minTickInterval: 1,
  },
  _id: {
    tickCount: 7,
    range: [0.04, 0.96],
  },
};
export default class Dashboard extends React.Component {
  render() {
    const { title, lineCartData, firstTitle, secondTitle } = this.props;
    return (
      <div className="dashboard">
        <div className="dashboard__header">
          <span className="dashboard__header__title">{title}</span>
          <p className="dashboard__header__info">
            {firstTitle}： <span>{lineCartData.pvTotal}</span>
          </p>
          <p className="dashboard__header__info">
            {secondTitle}： <span>{lineCartData.uvTotal}</span>
          </p>
          {/* <p className="dashboard__header__percentage"><Icon type="arrow-up" />12.3%</p> */}
        </div>
        <div className="dashboard__content">
          {lineCartData && lineCartData.dataList ? (
            <Chart
              height={400}
              data={lineCartData.dataList}
              scale={cols}
              forceFit
            >
              <Axis name="_id" />
              <Axis name="count" />
              <Tooltip
                crosshairs={{
                  type: 'y',
                }}
              />
              <Geom
                type="line"
                position="_id*count"
                size={2}
                color={'title'}
                shape={'smooth'}
              />
              <Geom
                type="point"
                position="_id*count"
                size={4}
                shape={'circle'}
                color={'title'}
                style={{
                  stroke: '#fff',
                  lineWidth: 1,
                }}
              />
            </Chart>
          ) : (
            <div className="dashboard-loading">
              <Spin />
            </div>
          )}
        </div>
      </div>
    );
  }
}
