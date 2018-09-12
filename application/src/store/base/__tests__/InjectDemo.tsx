import React from 'react';
import { observer } from 'mobx-react';
import { ENTITY_NAME } from '@/store';
import inject, { IVM, IInjectedStoreProps } from '@/store/inject';

type IProps = {
  id: number;
} & IInjectedStoreProps<VM>;

class VM implements IVM {
  dispose() {}
}

@observer
class InjectDemo extends React.Component<IProps> {
  render(): React.ReactNode {
    const { getEntity } = this.props;
    const post = getEntity(ENTITY_NAME.POST, 1);
    return <div>demo: {JSON.stringify(post)}</div>;
  }
}

export default inject(VM)(InjectDemo);
