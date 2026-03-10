import React from 'react'
export const contexts = React.createContext(null)
export const configContext = React.createContext(null)

export const Provider = contexts.Provider
let CustomConsumer = contexts.Consumer
let CustomConfigConsumer = configContext.Consumer
if (typeof window == 'undefined') {
  CustomConsumer = contexts.Consumer._context
  CustomConfigConsumer = configContext.Consumer._context
}

export const Consumer = CustomConsumer

export const ConfigProvider = configContext.Provider
export const ConfigConsumer = CustomConfigConsumer

export function connectToStore(ReactSublass) {
  class ReactBaseComponent extends React.Component {
    // static displayName = `StoreProvider(${ReactSublass.displayName})`;
    static defaultProps = {
      getRef: () => {}
    }
    render() {
      return (
        <Consumer>
          {(store) => {
            return (
              <ConfigConsumer>
                {(config) => (
                  <ReactSublass
                    {...this.props}
                    store={store}
                    config={config}
                    ref={this.props.getRef}
                  />
                )}
              </ConfigConsumer>
            )
          }}
        </Consumer>
      )
    }
  }
  return ReactBaseComponent
}
