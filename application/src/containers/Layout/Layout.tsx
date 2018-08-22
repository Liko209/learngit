import React, { Component } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

type Direction = 'horizon' | 'vertical';

interface IProps {
  children: any;
}

interface IStates {
  type: Direction;
}

class Layout extends Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      type: 'horizon',
    };
    this.updateState = this.updateState.bind(this);
    this.initial = this.initial.bind(this);
    this.initialHorizon = this.initialHorizon.bind(this);
    this.windowResizeVertical = this.windowResizeVertical.bind(this);
    this.windowResizeHorizon = this.windowResizeHorizon.bind(this);
  }

  componentWillMount() {
    // this.updateState(this.props);
  }

  componentDidMount() {
    // this.initial();
    // const type = this.state.type;
    // if (type === 'vertical') {
    //   window.addEventListener('resize', this.windowResizeVertical);
    // } else if (type === 'horizon') {
    //   window.addEventListener('resize', this.windowResizeHorizon);
    // }
  }

  componentWillReceiveProps(nextProps: IProps) {
    // this.updateState(nextProps);
  }

  componentDidUpdate() {
    // this.initial();
  }

  componentWillUnmount() {
    // const type = this.state.type;
    // if (type === 'vertical') {
    //   window.removeEventListener('resize', this.windowResizeVertical);
    // } else if (type === 'horizon') {
    //   window.removeEventListener('resize', this.windowResizeHorizon);
    // }
  }

  updateState(props: IProps) {
    // let type = this.state.type;
    // if (props.children.length > 0) {
    //   if (props.children[0].type.displayName === 'Horizon') {
    //     type = 'horizon';
    //   } else if (props.children[0].type.displayName === 'Vertical') {
    //     type = 'vertical';
    //   }
    // }
    // this.setState({ type });
  }

  initial() {
    // const type = this.state.type;
    // if (type === 'vertical') {
    //   // this.initialVertical();
    //   // this.eventHandle();
    //   // this.windowResizeVertical();
    // } else if (type === 'horizon') {
    //   this.initialHorizon();
    //   // this.eventHandle();
    //   this.windowResizeHorizon();
    // }
  }

  initialHorizon() {
    // todo
    // React.Children.forEach(this.props.children, (child: ReactChild, index: number) => {
    //   console.log('name =', child);
    // });
  }

  windowResizeVertical() { }

  windowResizeHorizon() { }

  render() {
    const { children } = this.props;
    return (
      <Wrapper>
        {children}
      </Wrapper>
    );
  }
}

export default Layout;
