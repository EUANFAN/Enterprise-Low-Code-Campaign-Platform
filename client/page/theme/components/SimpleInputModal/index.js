import React from 'react';

import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import HEInput from 'components/HEInput';
import HESkyLayer from 'components/HESkyLayer';
import { noop } from 'utils/FunctionUtils';

import './index.less';

function Row(props) {
  return (
    <div className="simple-input-modal__content__row">{props.children}</div>
  );
}

function Label(props) {
  return (
    <label className="simple-input-modal__content__row__label">
      {props.children}
    </label>
  );
}

class SimpleImputModal extends React.Component {
  static defaultProps = {
    onClickAway: noop,
  };

  state = {
    value: '',
  };

  _handleNameChange = (event) => {
    // $FlowFixMe 不知道为什么这里会报问题，应该是 Flow 的 Bug
    const newTarget = event.target.value;
    this.setState({ value: newTarget });
  };

  _handleSubmit = (event) => {
    this.props.onSubmit(event, this.state.value);
  };

  render() {
    const { title, labelText, placeholder, onClose } = this.props;
    const { value } = this.state;

    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="simple-input-modal">
          <HEModalHeader title={title} onClose={onClose} />
          <HEModalContent className="simple-input-modal__content">
            <Row>
              <Label>{labelText}：</Label>
              <HEInput
                value={value}
                onChange={this._handleNameChange}
                className="simple-input-modal__content__row__input"
                type="text"
                maximumLetters={20}
                placeholder={placeholder}
              />
            </Row>
          </HEModalContent>
          <HEModalActions>
            <HEButton onClick={this._handleSubmit}>{'确定'}</HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default SimpleImputModal;
