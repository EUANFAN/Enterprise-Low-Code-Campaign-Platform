import React from 'react';
import ReactDOM from 'react-dom';
import Confirm from './index.js';
const TARGET_DOM_ID = 'confirm-layer';

function getSkyLayer() {
  let target = document.getElementById(TARGET_DOM_ID);
  if (target) {
    return target;
  }
  const skyLayerElement = document.createElement('div');
  skyLayerElement.id = TARGET_DOM_ID;
  if (document.body) {
    document.body.appendChild(skyLayerElement);
  }
  return skyLayerElement;
}

const skyLayerContainer = getSkyLayer();

function renderConfirm(message, title, onConfirm, onCancel) {
  ReactDOM.render(
    <Confirm
      title={title}
      message={message}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
    skyLayerContainer
  );
}

function closeToast() {
  ReactDOM.render(null, skyLayerContainer);
}

export default function confirm(message, title) {
  return new Promise((resolve, reject) => {
    function handleConfirm() {
      closeToast();
      resolve();
    }
    function handleCancel() {
      closeToast();
      reject(new Error('用户取消'));
    }
    renderConfirm(message, title, handleConfirm, handleCancel);
  });
}
