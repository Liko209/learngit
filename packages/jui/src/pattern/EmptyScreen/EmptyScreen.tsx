/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-26 10:56:31
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import {
  spacing,
  height,
  width,
  typography,
  grey,
} from '../../foundation/utils';

type JuiEmptyScreenProps = {
  image: {
    url: string;
    width: number;
    height: number;
  };
  text: string;
  content: string;
  actions: JSX.Element[];
  align?: 'flex-start' | 'flex-end' | 'center';
};

const StyledWrapper = styled.div<{ align?: string }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ align }) => (align ? align : 'center')};
  padding-top: ${spacing(9)};
`;

type PicProps = { width: number; height: number };

const StyledPic = styled.img<PicProps>`
  width: ${(props: PicProps) => width(props.width)}; // 67
  height: ${(props: PicProps) => height(props.height)}; // 53
  margin-bottom: ${spacing(7)};
`;

const StyledText = styled.div`
  ${typography('subheading1')};
  color: ${grey('900')};
  margin-bottom: ${spacing(2)};
`;
const StyledContent = styled.div`
  ${typography('body1')};
  color: ${grey('700')};
  margin-bottom: ${spacing(3)};
`;

const StyledActionWrapper = styled.div`
  margin: ${spacing(0, 2, 4, 0)};
  &:last-child {
    margin: 0;
  }
`;

const StyledActions = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

const JuiEmptyScreen = (props: JuiEmptyScreenProps) => {
  const { align, image, text, content, actions } = props;

  return (
    <StyledWrapper align={align}>
      <StyledPic src={image.url} width={image.width} height={image.height} />
      <StyledText>{text}</StyledText>
      <StyledContent>{content}</StyledContent>
      <StyledActions>
        {actions.length
          ? actions.map((action, inx) => (
              <StyledActionWrapper key={inx}>{action}</StyledActionWrapper>
            ))
          : actions}
      </StyledActions>
    </StyledWrapper>
  );
};

export { JuiEmptyScreen };
