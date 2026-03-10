import 'globals';
import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react';
import ControlWrapConfig from '../ruleManage/components/ControlWrapConfig';
import './App.less';

@observer
class App extends React.Component {
  state = { ruleComponent: null };

  UNSAFE_componentWillMount() {
    window.addEventListener('message', async (event) => {
      console.log(
        '🚀 ~ file: main.js ~ line 14 ~ App ~ window.addEventListener ~ event',
        event
      );

      if (event.data && typeof event.data === 'string') {
        let params = JSON.parse(event.data);

        this.setState({ ruleComponent: params });
      }
    });
  }

  componentDidCatch(error, info) {
    console.log('file rulePreview: main.js ~ line 27 ~ info', info);
    console.log('file rulePreview: main.js ~ line 28 ~ error', error);

    this.setState({ hasError: true });
  }

  render() {
    const { ruleComponent, hasError } = this.state;
    let hasErrorEle = <div className="widget-error">当前组件异常</div>;
    let ruleComponentEle = null;

    if (ruleComponent) {
      if (!hasError) {
        hasErrorEle = <ControlWrapConfig ruleComponent={ruleComponent} />;
      }

      ruleComponentEle = (
        <div className="rule-config__content">{hasErrorEle}</div>
      );
    }

    return (
      <div className="rule-config">
        <div className="rule-config__mask"></div>
        <div className="rule-config__container">{ruleComponentEle}</div>
      </div>
    );
  }
}

export default App;

ReactDOM.render(<App />, document.getElementById('main'));
