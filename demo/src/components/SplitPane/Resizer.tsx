/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-04-04 15:06:42
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';

interface Props {
  split?: 'vertical' | 'horizontal';
  className: string;
  children: JSX.Element | React.ReactNode;
  onMouseDown(event: React.MouseEvent<HTMLElement>): void;
}

class Resizer extends React.Component<Props> {
  static displayName = 'Resizer';
  static defaultProps = {
    split: 'vertical'
  };

  constructor(props: Props, context: any) {
    super(props, context);
    this.onMouseDown = this.onMouseDown.bind(this);
  }

  onMouseDown(event: React.MouseEvent<HTMLElement>) {
    this.props.onMouseDown(event);
  }

  render() {
    const { split, className, children } = this.props;
    const classes = ['Resizer', split, className];

    const style: React.CSSProperties = {
      position: 'relative',
      outline: 'none',
      zIndex: 2
    };

    if (split === 'vertical') {
      Object.assign(style, { height: '100%' });
    } else {
      Object.assign(style, { width: '100%' });
    }

    return (
      <div
          style={style}
          className={classes.join(' ')}
          onMouseDown={this.onMouseDown}
          role="button"
          tabIndex={0}
      >
        {children}
      </div>
    );
  }
}

export default Resizer;
