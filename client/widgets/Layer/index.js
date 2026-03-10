import { observer } from 'mobx-react';
import Container from 'common/Container';
import Widget from '../Widget';
import { connectToStore } from 'components/StoreContext';

@observer
class Layer extends Container {
  constructor(props) {
    super(props);
    this.fromLayer = true;
    this.WidgetClass = Widget;
  }
}
export default connectToStore(Layer);
