import { useObserver } from 'mobx-react-lite';
import React from 'react';
import useRuleComponentEditStore from 'hook/useRuleComponentEditStore';
const InjectCComponent =
  (paths = []) =>
    (Comp) => {
      return (props) => {
        const store = useRuleComponentEditStore();
        return useObserver(() => {
          const newProps =
          paths.length === 0
            ? paths.reduce((memo, next) => {
              memo[next] = store.next;
            }, {})
            : store;
          return <Comp {...props} {...newProps} />;
        });
      };
    };

export default InjectCComponent;
