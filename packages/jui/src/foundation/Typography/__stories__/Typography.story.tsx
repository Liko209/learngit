/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-27 16:11:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import styled from '../../styled-components';
import { typography } from '../../utils/styles';
import { JuiPaper } from '../../../components/Paper';
import { JuiDivider } from '../../../components/Divider';

const variants = [
  'display4',
  'display3',
  'display2',
  'display1',
  'headline',
  'title2',
  'title1',
  'subheading2',
  'subheading1',
  'body2',
  'body1',
  'caption2',
  'caption1',
  'button',
];

const Text = styled.div<{ variant: any }>`
  ${({ variant }) => typography(variant)}
  margin-bottom: 1rem;
  flex: 2 1 0;
`;

const Attribute = styled('span')`
  ${typography('caption1')};
  flex: 1 1 0;
`;

const StyledContainer = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 1rem;
`;

class TypographyShow extends React.PureComponent<{ variant: string }> {
  text: React.RefObject<any>;
  state: any;
  constructor(props: any) {
    super(props);
    this.text = React.createRef();
    this.state = {};
  }

  componentDidMount() {
    const { fontSize, fontWeight, lineHeight } = window.getComputedStyle(
      this.text.current,
    );
    this.setState({
      fontSize,
      fontWeight,
      lineHeight,
    });
  }

  render() {
    return (
      <StyledContainer>
        <Text ref={this.text} variant={this.props.variant}>
          {this.props.variant}
        </Text>
        <Attribute>{this.state.fontWeight}</Attribute>
        <Attribute>{this.state.fontSize}</Attribute>
        <Attribute>{this.state.lineHeight}</Attribute>
      </StyledContainer>
    );
  }
}

storiesOf('Foundation', module).add('Typography', () => (
  <JuiPaper
    style={{
      padding: '4rem',
      width: '1000px',
    }}
  >
    <StyledContainer>
      <Text variant={'caption1'}>Name/TypeFace</Text>
      <Attribute>font weight</Attribute>
      <Attribute>font size</Attribute>
      <Attribute>line height</Attribute>
    </StyledContainer>
    <JuiDivider />
    {variants.map(variant => (
      <>
        <TypographyShow key={variant} variant={variant}>
          {variant}
        </TypographyShow>
        <JuiDivider />
      </>
    ))}
  </JuiPaper>
));
