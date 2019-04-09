/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 09:43:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import {
  grey,
  spacing,
  height,
  typography,
  palette,
} from '../../../foundation/utils/styles';
import { JuiTypography } from '../../../foundation/Typography';

const SearchTitleWrapper = styled.div`
  padding: ${spacing(0, 4)};
  height: ${height(8)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${grey('200')};
`;

const SearchTitleText = styled(JuiTypography)`
  && {
    ${typography('caption1')};
    color: ${grey('500')};
  }
`;

const ShowMoreBtn = styled.span`
  color: ${palette('primary', 'main')};
  ${typography('caption1')};
  text-decoration: none;
  cursor: pointer;
`;

type JuiSearchTitleProps = {
  title: String;
  showButton: boolean;
  buttonText: string;
  onButtonClick?: (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
  ) => void;
  buttonAutomationId?: string;
};

const JuiSearchTitle = (props: JuiSearchTitleProps) => {
  const {
    title,
    showButton,
    buttonText,
    onButtonClick,
    buttonAutomationId,
    ...rest
  } = props;

  return (
    <SearchTitleWrapper {...rest}>
      <SearchTitleText>{title}</SearchTitleText>
      {showButton && (
        <ShowMoreBtn
          data-test-automation-id={buttonAutomationId}
          onClick={onButtonClick}
        >
          {buttonText}
        </ShowMoreBtn>
      )}
    </SearchTitleWrapper>
  );
};

export { JuiSearchTitle, JuiSearchTitleProps };
