import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HESkyLayer from 'components/HESkyLayer';
import HEButton from 'components/HEButton';
import HEInput from 'components/HEInput';
import HESelect from 'components/HESelect';
import './index.less';
import { toastError } from 'components/HEToast';
import { getBizList } from 'apis/ServicesApi';
const CreateRuleComponentModal = props => {
  const [bizList, setBizList] = useState([]);
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [department, setDepartment] = useState(PageData?.userInfo?.userDept);
  const handleSubmit = () => {
    if(!type) return toastError('请输入组件名称');
    const validateType = /^[A-Za-z]+$/.test(type);
    if(!validateType) {
      return toastError('请输入有效的组件名称');
    }
    if(!name) return toastError('请输入中文名称');
    props.onSubmit && props.onSubmit({ type, name, desc, department });
  };
  useEffect(() => {
    const init = async () => {
      const { list: bizList = [] } = await getBizList();
      setBizList(bizList.map(item => ({ key: item.name, value: item.enname })));
    };
    init();
  }, []);
  return (
    <HESkyLayer onOverlayClick={props.onClose} className="create-rule-component-modal-skylayer">
      <HEModal className="create-rule-component-modal">
        <HEModalHeader title={'创建规则组件'} onClose={props.onClose} />
        <HEModalContent className="create-rule-component-modal__content">
          <div className='create-rule-component-modal__content__row'>
            <div className='create-rule-component-modal__content__row__label'>组件名称：</div>
            <HEInput
              className="create-rule-component-modal__content__row__input"
              value={type}
              onChange={e => setType(e.target.value)}
              type="text"
              maximumLetters={20}
              placeholder={'如: SubmitButton，概括组件功能，要求为大小写字母'}
            />
          </div>
          <div className='create-rule-component-modal__content__row'>
            <div className='create-rule-component-modal__content__row__label'>中文名称：</div>
            <HEInput
              className="create-rule-component-modal__content__row__input"
              value={name}
              onChange={e => setName(e.target.value)}
              type="text"
              maximumLetters={20}
              placeholder={'如: 提交按钮'}
            />
          </div>
          <div className='create-rule-component-modal__content__row'>
            <div className='create-rule-component-modal__content__row__label'>组件简介：</div>
            <Input.TextArea
              className="create-rule-component-modal__content__row__input"
              placeholder={'如: 用于提交表单信息'}
              onChange={e => setDesc(e.target.value)}
              value={desc}
              autoSize
              maxLength={160}
              style={{
                padding: '6px 20px',
                color: ' #333'
              }}
            />
          </div>
          <div className='create-rule-component-modal__content__row'>
            <div className='create-rule-component-modal__content__row__label'>所属部门：</div>
            <HESelect
              className="create-rule-component-modal__content__row__select"
              value={department}
              onSelect={(e, val) => setDepartment(val)}
              options={bizList}
              placeholder={'请选择组件的应用场景'}
            />
          </div>
        </HEModalContent>
        <HEModalActions>
          <HEButton onClick={handleSubmit}>确定</HEButton>
        </HEModalActions>
      </HEModal>
    </HESkyLayer>
  );
};

export default CreateRuleComponentModal;
