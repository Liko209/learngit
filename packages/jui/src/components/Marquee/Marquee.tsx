/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-04-19 14:56:05
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import styled, { keyframes, css } from '../../foundation/styled-components';

type State = {
  overflowWidth: number;
};

type Props = {
  hoverToStop: boolean;
  time: number;
  text: string;
  className?: string;
};

type NodeProps = {
  overflowWidth: number;
  hoverToStop: boolean;
  time: number;
};

const StyledContainer = styled.div`
  white-space: nowrap;
  overflow: hidden;
`;

const marquee = keyframes`
  0%   { transform: translate(0, 0); }
  100% { transform: translate(-100%, 0); }
`;

const StyledNode = styled.span<NodeProps>`
  display: inline-block;
  padding-left: ${({ overflowWidth }) => (overflowWidth > 0 ? '100%' : '')};
  text-indent: 0;
  ${({ overflowWidth, time }) =>
    overflowWidth > 0
      ? css`
          animation: ${marquee} ${time}s linear infinite;
        `
      : ''}
  &:hover {
    ${({ overflowWidth, hoverToStop }) =>
      hoverToStop && overflowWidth > 0 ? 'animation-play-state: paused;' : ''};
  }
`;

class JuiMarquee extends PureComponent<Props> {
  static defaultProps = {
    hoverToStop: true,
    time: 15,
  };

  state: State = {
    overflowWidth: 0,
  };

  containerRef = React.createRef<any>();
  nodeRef = React.createRef<any>();

  componentDidMount() {
    this._measureText();
  }

  componentDidUpdate() {
    this._measureText();
  }

  render() {
    const { overflowWidth } = this.state;
    const { hoverToStop, time, text } = this.props;
    return (
      <StyledContainer
        className={`ui-marquee ${this.props.className}`}
        ref={this.containerRef}
      >
        <StyledNode
          time={time}
          ref={this.nodeRef}
          title={text}
          overflowWidth={overflowWidth}
          hoverToStop={hoverToStop}
        >
          {text}
        </StyledNode>
      </StyledContainer>
    );
  }

  private _measureText() {
    const container = this.containerRef.current;
    const node = this.nodeRef.current;

    if (container && node) {
      const containerWidth = container.offsetWidth;
      const textWidth = node.offsetWidth;
      const overflowWidth = textWidth - containerWidth;

      if (overflowWidth !== this.state.overflowWidth) {
        this.setState({
          overflowWidth,
        });
      }
    }
  }
}

export { JuiMarquee };
