import React from 'react';
import { Switch, withRouter } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import 'common/style/animations.less';

class TransitionSwitch extends React.Component {
  render() {
    const { location, transitionKey, classNames, timeout, children } = this.props;
    return (
      <TransitionGroup component={null}>
        <CSSTransition
          key={transitionKey || location.key}
          classNames={classNames}
          timeout={timeout}
        >
          <Switch location={location}>{children}</Switch>
        </CSSTransition>
      </TransitionGroup>
    );
  }
}

export const shouldShowRedirect = (pathname) => {
  return god.location.pathname === pathname;
};

export default withRouter(TransitionSwitch);
