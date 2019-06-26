/*
 * @Author: isaac.liu
 * @Date: 2019-06-26 18:44:22
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent, ComponentType } from 'react';

function lazyComponent({
  loader,
  Loading = () => <div />,
}: {
  loader: () => Promise<{ default: ComponentType<any> }>;
  Loading?: ComponentType<any>;
}) {
  const a = loader();
  type State = { Comp: ComponentType<any> | null };
  return class extends PureComponent<any, State> {
    constructor(props: any) {
      super(props);
      this.state = { Comp: null };
    }
    async componentWillMount() {
      const Component = (await loader()).default;
      this.setState({ Comp: Component });
    }
    render() {
      const { Comp } = this.state;
      return Comp ? <Comp {...this.props} /> : <Loading />;
    }
  };
}

export { lazyComponent };
