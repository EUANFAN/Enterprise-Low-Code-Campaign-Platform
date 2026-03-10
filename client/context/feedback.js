import React from 'react';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export function connectContext(Context) {
  return function (Component) {
    return class extends React.Component {
      static displayName = `ConnectModal(${getDisplayName(Component)})`;

      render() {
        return (
          <Context.Consumer>
            {(methods) => <Component {...this.props} {...methods} />}
          </Context.Consumer>
        );
      }
    };
  };
}

export const ConfirmContext = React.createContext({});
export const connectConfirm = connectContext(ConfirmContext);

export const ModalContext = React.createContext({});
export const connectModal = connectContext(ModalContext);

export const ToastContext = React.createContext({});
export const connectToast = connectContext(ToastContext);
