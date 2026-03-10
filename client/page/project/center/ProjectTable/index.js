import React from 'react';
import { PROJECT_STATUS } from 'common/constants';
import HEIcon from 'components/HEIcon';
import Moment from 'moment';
import './index.less';
import HETable from 'components/HETable';
import ProjectActionBar from 'components/ProjectActionBar';
import User from 'components/icons/User';
import { Tooltip } from 'antd';

export default class ProjectTable extends React.Component {
  state = {
    list: null,
  };
  render() {
    const {
      onRestore,
      onShowInfo,
      onOpen,
      onCheck,
      onDelete,
      onCheckRevisions,
      onPreview,
      onMove,
      onTransfer,
      onCopyLink,
      onCopy,
      onData,
      onShowFormStatistics,
      hasFormWidget,
      listToRender,
      isBulkMode,
      onCollaborate,
      selectedIds,
      onSelect,
      onRename,
    } = this.props;
    let rowSelection = {
      type: 'checkbox',
      selectedRowKeys: selectedIds,
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        onSelect(nativeEvent, record._id);
      },
      getCheckboxProps: (record) => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    const columns = [
      {
        title: '序号',
        dataIndex: 'num',
        width: 60,
        render: (text, record, index) => <span>{index + 1}</span>,
      },
      {
        title: '项目ID',
        dataIndex: 'id',
        width: 100,
        ellipsis: true,
        render: (text) => (
          <span>
            <Tooltip placement="topLeft" title={text}>
              {text}
            </Tooltip>
          </span>
        ),
      },
      {
        title: '项目名称',
        dataIndex: 'name',
        ellipsis: true,
        render: (text, record) => {
          return (
            <span>
              {record.isFolder ? (
                <HEIcon
                  className="table-icon-folder"
                  type="icon-folder"
                ></HEIcon>
              ) : (
                <HEIcon className="table-icon-file" type="icon-file"></HEIcon>
              )}
              {text && text.length < 20 ? (
                text
              ) : (
                <Tooltip title={text}>{text}</Tooltip>
              )}
            </span>
          );
        },
      },
      {
        title: '上线时间',
        dataIndex: 'runingStartTime',
        render: (text, record) => {
          return (
            <span>
              {record.isFolder
                ? '--'
                : Moment(record.revisionData.runingStartTime).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )}
            </span>
          );
        },
      },
      {
        title: '下线时间',
        dataIndex: 'runingEndTime',
        render: (text, record) => {
          return (
            <span>
              {record.isFolder
                ? '--'
                : Moment(record.revisionData.runingEndTime).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )}
            </span>
          );
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (status, record) => {
          const state = PROJECT_STATUS[status];
          return record.isFolder ? (
            <span>--</span>
          ) : (
            <span
              style={
                state && {
                  backgroundColor: state.backgroundColor,
                  color: state.color,
                  borderRadius: state.borderRadius,
                  padding: state.padding,
                }
              }
            >
              {state.text}
            </span>
          );
        },
      },
      {
        title: '操作',
        width: 230,
        dataIndex: '_id',
        render: (text, record) => {
          const id = record._id;
          return (
            <ProjectActionBar
              isCard={false}
              isFolder={record.isFolder}
              onCheckRevisions={(event) => onCheckRevisions(event, id)}
              onPreview={(event) => onPreview(event, id, record)}
              onOpen={(event) => onOpen(event, id)}
              onCheck={(event) => onCheck(event, id)}
              onShowInfo={(event) => onShowInfo(event, id)}
              onCopy={(event) => onCopy(event, id)}
              onCopyLink={(event) => onCopyLink(event, id)}
              onData={(event) =>
                onData(
                  event,
                  id,
                  record?.themeId || record?.revisionData?.themeId
                )
              }
              onMove={(event) => onMove(event, id)}
              onDelete={(event) => onDelete(event, id)}
              onRename={(event) => onRename(event, id, record)}
              onRestore={(event) => onRestore(event, id)}
              onTransfer={(event) => onTransfer(event, id)}
              onCollaborate={(event) => onCollaborate(event, id)}
              onShowFormStatistics={(event) => onShowFormStatistics(event, id)}
              hasFormWidget={hasFormWidget}
              projectOrigin={record.origin}
              themeId={record.themeId}
              ruleWidget={record.ruleWidget}
              project={record}
            ></ProjectActionBar>
          );
        },
      },
      {
        title: '创建人',
        width: 200,
        dataIndex: 'ownerId',
        fixed: 'right',
        render: (ownerId) => (
          <span>
            <User className="table-icon-user" />
            {ownerId}
          </span>
        ),
      },
    ];
    return (
      <HETable
        className="project-list-page__main__table-container"
        columns={columns}
        dataSource={listToRender.map((item) => {
          // _id是antd table的特殊字段，会出错
          return {
            ...item,
            id: item._id,
          };
        })}
        rowSelection={
          isBulkMode
            ? {
                ...rowSelection,
              }
            : undefined
        }
        rowKey={() => Math.random()}
        scroll={{ x: 1300 }}
        pagination={false}
        size={'default'}
      />
    );
  }
}
