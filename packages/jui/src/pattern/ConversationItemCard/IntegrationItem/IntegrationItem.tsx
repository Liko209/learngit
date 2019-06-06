/*
 * @Author: isaac.liu
 * @Date: 2019-05-03 14:01:29
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import { spacing, typography, palette } from '../../../foundation/utils';

const Wrapper = styled.div`
  ${typography('body1')};
  a {
    color: ${palette('primary', 'main')};
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const BodyWrapper = styled.div`
  margin-top: ${spacing(2.5)};
`;

const MarkdownWrapper = styled.div`
  ${typography('body1')};
  white-space: pre-wrap;
`;

type JuiIntegrationItemProps = {
  title?: null | React.ReactChild | (React.ReactChild | null)[];
  body?: null | React.ReactChild | (React.ReactChild | null)[];
};

const JuiIntegrationItemView = (props: JuiIntegrationItemProps) => {
  const { title, body } = props;
  if (title || body) {
    return (
      <Wrapper>
        {title && (
          <MarkdownWrapper data-test-automation-id="title">
            {title}
          </MarkdownWrapper>
        )}
        {body && (
          <BodyWrapper>
            <MarkdownWrapper data-test-automation-id="body">
              {body}
            </MarkdownWrapper>
          </BodyWrapper>
        )}
      </Wrapper>
    );
  }
  return null;
};

export { JuiIntegrationItemView, JuiIntegrationItemProps };
