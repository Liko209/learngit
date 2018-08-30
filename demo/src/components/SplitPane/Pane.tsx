/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-04-04 15:06:36
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';

interface Props {
  split?: 'vertical' | 'horizontal';
  className: string;
  children: React.ReactNode[];
}

interface State {
  size: string | number;
}

class Pane extends React.Component<Props, State> {
  static displayName = 'Pane';
  static defaultProps = {
    split: 'vertical',
  };
  private node: HTMLDivElement | null;

  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      size: '',
    };
  }

  render() {
    const { split } = this.props;
    const classes = ['Pane', split, this.props.className];

    const style: React.CSSProperties = {
      flex: 1,
      position: 'relative',
      outline: 'none',
      width: '',
      height: '',
    };

    if (split === 'vertical') {
      style.height = '100%';
    } else {
      style.width = '100%';
    }

    if (this.state.size) {
      if (split === 'vertical') {
        style.width = this.state.size;
      } else {
        style.height = this.state.size;
      }
      style.flex = 'none';
    }

    return (
      <div
          ref={(el) => {
            this.node = el;
          }}
          className={classes.join(' ')}
          style={style}
      >
        {this.props.children}
      </div>
    );
  }
}

export default Pane;
