import React from 'react';
import ReactDOM from 'react-dom';

import HEToast from 'components/HEToast';

const DEFAULT_TIMEOUT = 3000;

const TARGET_DOM_ID = 'toast-layer';

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

export function closeToast() {
  ReactDOM.render(null, skyLayerContainer);
}

function renderToast(message, type, desc) {
  ReactDOM.render(
    <HEToast message={message} type={type} desc={desc} />,
    skyLayerContainer
  );
}

export function toastSuccess(message, timeout = DEFAULT_TIMEOUT, desc) {
  renderToast(message, 'Success', desc);
  setTimeout(() => closeToast(), timeout);
}

export function toastError(message, timeout = DEFAULT_TIMEOUT, desc) {
  renderToast(message, 'Error', desc);
  setTimeout(() => closeToast(), timeout);
}

export function toastLoading(message, timeout = DEFAULT_TIMEOUT, desc) {
  renderToast(message, 'Loading', desc);
  setTimeout(() => closeToast(), timeout);
}
export function toastInfo(message, timeout = DEFAULT_TIMEOUT, desc) {
  renderToast(message, 'Info', desc);
  setTimeout(() => closeToast(), timeout);
}
export function toastWarn(message, timeout = DEFAULT_TIMEOUT, desc) {
  renderToast(message, 'Warn', desc);
  setTimeout(() => closeToast(), timeout);
}
