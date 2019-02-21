/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-07 19:14:28
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType, ComponentClass, ReactNode } from 'react';

type Props = { delay: number; placeholder?: ReactNode };
type States = { visible: boolean };

function withDelay<T>(Component: ComponentType<T>): ComponentClass<Props | T> {
  class ComponentWithDelay extends React.PureComponent<Props, States> {
    private _timer: NodeJS.Timer;
    static defaultProps = {
      delay: 0,
    };

    constructor(props: Props) {
      super(props);

      this.state = {
        visible: props.delay === 0,
      };
    }

    componentDidMount() {
      this._timer = setTimeout(this._show, this.props.delay);
    }

    componentWillUnmount() {
      clearTimeout(this._timer);
    }

    render() {
      const { delay, placeholder, ...rest } = this.props;
      return this.state.visible ? (
        <Component {...rest as T} />
      ) : (
        placeholder || null
      );
    }

    private _show = () => {
      this.setState({ visible: true });
    }
  }
  return ComponentWithDelay;
}

export { withDelay };
