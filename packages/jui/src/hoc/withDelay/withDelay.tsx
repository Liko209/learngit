/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-07 19:14:28
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType, ComponentClass } from 'react';

type Props = { delay: number };
type States = { visible: boolean };

function withDelay<T>(Component: ComponentType<T>): ComponentClass<Props | T> {
  class ComponentWithDelay extends React.PureComponent<Props, States> {
    static defaultProps = {
      delay: 0,
    };

    state = {
      visible: false,
    };

    timer: NodeJS.Timer;

    componentDidMount() {
      this.timer = setTimeout(() => {
        this.setState({ visible: true });
      },                      this.props.delay);
    }

    componentWillUnmount() {
      clearTimeout(this.timer);
    }

    render() {
      const { delay, ...rest } = this.props;
      if (!this.state.visible) return null;

      return <Component {...rest} />;
    }
  }
  return ComponentWithDelay;
}

export { withDelay };
