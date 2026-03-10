import React, { useState } from 'react';
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions
} from 'components/HEModal';
import HESkyLayer from 'components/HESkyLayer';
import HEButton from 'components/HEButton';
import HEInput from 'components/HEInput';
// import HESelect from 'components/HESelect';
import './index.less';
import { toastError } from 'components/HEToast';
const PublishRuleModal = (props) => {
  const token = props.accessToken();
  const [info, setInfo] = useState('');
  // const [env, setEnv] = useState('dev');
  const [access_token, setToken] = useState(token || '');
  const handleSubmit = () => {
    if (!info) return toastError('请输入commit提交信息');
    const validateType = /^[A-Za-z0-9%-_]+$/.test(access_token);
    if (!validateType) {
      return toastError('请输入有效的access_token');
    }
    props.onSubmit && props.onSubmit({ info, end: 'dev', access_token });
  };
  return (
    <HESkyLayer
      onOverlayClick={props.onClose}
      className="create-rule-component-modal-skylayer"
    >
      <HEModal className="create-rule-component-modal">
        <HEModalHeader title={'是否发布规则组件'} onClose={props.onClose} />
        <HEModalContent className="create-rule-component-modal__content">
          <div className="create-rule-component-modal__content__row">
            <div className="create-rule-component-modal__content__row__label">
              提交信息:
            </div>
            <HEInput
              className="create-rule-component-modal__content__row__input"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              type="text"
              maximumLetters={20}
              placeholder={'请输入commit提交信息'}
            />
          </div>
          {/* <div className="create-rule-component-modal__content__row">
            <div className="create-rule-component-modal__content__row__label">
              发布环境:
            </div>
            <HESelect
              value={env}
              onSelect={(e, env) => {
                setEnv(env);
              }}
              className="create-rule-component-modal__content__row__input"
              options={[
                {
                  key: '开发环境',
                  value: 'dev',
                },
                {
                  key: '测试环境',
                  value: 'test',
                },
                {
                  key: '线上环境',
                  value: 'online',
                },
              ]}
            ></HESelect>
          </div> */}
          {!token && (
            <div className="create-rule-component-modal__content__row">
              <div className="create-rule-component-modal__content__row__label">
                <a href="https://git.100tal.com/profile/personal_access_tokens" style={{ color: '#4a82f7' }}>
                  access token:
                </a>
              </div>
              <HEInput
                className="create-rule-component-modal__content__row__input"
                value={access_token}
                onChange={(e) => setToken(e.target.value)}
                type="text"
                placeholder={'请输入gitlib的access_token'}
              />
            </div>
          )}
        </HEModalContent>

        <HEModalActions>
          <HEButton onClick={props.onClose} className="close">
            取消
          </HEButton>
          <HEButton onClick={handleSubmit}>确定</HEButton>
        </HEModalActions>
      </HEModal>
    </HESkyLayer>
  );
};

export default PublishRuleModal;
