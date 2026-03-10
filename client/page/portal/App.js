import React from 'react';
import { withRouter } from 'react-router-dom';
import HENavBarGroup from 'components/HENavBarGroup';
import { ModalContext, connectToast } from 'context/feedback';
import NoticeTip from '../components/NoticeTip';
import Index from './Index';
import './App.less';
class App extends React.Component {
  state = {
    appContext: {
      selectDepartmentId: '',
    },
  };
  handleSelect = (department) => {
    this.setState({ appContext: { selectDepartmentId: department } });
  };
  render() {
    return (
      <ModalContext.Provider value={{ ...this.state.appContext }}>
        <NoticeTip></NoticeTip>
        <div className="h5">
          <div className="h5__navbar">
            <HENavBarGroup
              showDepartmentSelect={true}
              onSelect={this.handleSelect}
            />
          </div>
          <div className="h5__content">
            <Index />
          </div>
        </div>
      </ModalContext.Provider>
    );
  }
}

export default connectToast(withRouter(App));
