
import React from 'react';
import InjectCComponent from '../InjectCComponent';
const ErrorBoundary = (errorMessage) => (Comp) => {

  @InjectCComponent(['hasError', 'handleError'])
  class ErrorBoundaryComp extends React.Component {
    componentDidCatch() {
      this.props.handleError(true);
    }
    render() {
      if (this.props.hasError) {
        return <h2>{errorMessage}</h2>;
      }
      return <Comp {...this.props}></Comp>;
    }
  }
  return ErrorBoundaryComp;
};


export default ErrorBoundary;
