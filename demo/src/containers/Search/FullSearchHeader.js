/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:11:02
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
// import { withRouter } from 'react-router-dom';
// import { observer } from 'mobx-react';
import styled from 'styled-components';

const Title = styled.h1`
  flex: 30%, 1, 0;
  word-wrap: break-word;
  font-weight: 300;
  color: #333;
  font-size: 32px;
  margin-right: 20px;
`;
const Input = styled.input`
  flex: 70% 1 1;
  box-sizing: border-box;
  border-radius: 5px;
  color: #000;
  font-weight: 600;
  opacity: 1;
  width: 100%;
  padding: 8px 4px;
  border: 1px solid #ccc;
  font-size: 16px;
  outline: 0;
`;
const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export default class FullSearchHeader extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      value: props.query
    };
  }
  onChange = event => {
    const value = event.target.value;
    this.setState({ value });
  };
  onKeyDown = event => {
    const query = event.target.value;
    if (!query || query.trim() === this.props.query) {
      return;
    }
    if (event.key === 'Enter') {
      return this.props.onSearch(query);
    }
  };
  UNSAFE_componentWillReceiveProps(nextprops) {
    this.setState({ value: nextprops.query });
  }
  render() {
    return (
      <Container>
        <Title>Searching for</Title>
        <Input
            type="text"
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            value={this.state.value}
        />
      </Container>
    );
  }
}
