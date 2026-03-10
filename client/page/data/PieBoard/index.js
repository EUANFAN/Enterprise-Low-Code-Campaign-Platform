import React from 'react';
import { Chart, Geom, Tooltip, Coord } from 'bizcharts';
import DataSet from '@antv/data-set';
import { Spin } from 'antd';
export default class CustomePie extends React.Component {
  render() {
    const { lineCartData } = this.props;
    const { DataView } = DataSet;
    const dv = new DataView();
    dv.source(lineCartData).transform({
      type: 'percent',
      field: 'count',
      dimension: 'id',
      as: 'percent',
    });
    const cols = {
      percent: {
        formatter: (val) => {
          val = (val * 100).toFixed(2) - 0 + '%';
          return val;
        },
      },
    };
    return (
      <div>
        {lineCartData && lineCartData.length ? (
          <Chart
            data={dv}
            scale={cols}
            height={350}
            padding={[5, 5, 5, 5]}
            style={{ position: 'relative', top: '-24px' }}
            forceFit
          >
            <Coord type="theta" radius={0.8} />
            <Tooltip
              showTitle={false}
              itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
            />
            <Geom
              type="intervalStack"
              position="percent"
              color="id"
              shape="radiusPie"
              tooltip={[
                'id*percent*name',
                (id, percent, name) => {
                  percent = (percent * 100).toFixed(2) - 0 + '%';
                  return {
                    id: id,
                    name: name,
                    value: percent,
                  };
                },
              ]}
            ></Geom>
          </Chart>
        ) : (
          <div className="dashboard-loading">
            <Spin />
          </div>
        )}
      </div>
    );
  }
}
