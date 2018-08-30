import React from 'react';
import { ENTITY_NAME } from '../constants';
import injectStore, { IComponentWithGetEntityProps } from '../../inject';

class InjectDemo extends React.Component<IComponentWithGetEntityProps> {
  render() {
    const { getEntity } = this.props;
    const post = getEntity(ENTITY_NAME.POST, 1);
    return (
      <div>demo: {JSON.stringify(post)}</div>
    );
  }
}

export default injectStore()(InjectDemo);
