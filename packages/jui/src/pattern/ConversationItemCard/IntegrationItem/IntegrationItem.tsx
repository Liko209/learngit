/*
 * @Author: isaac.liu
 * @Date: 2019-05-03 14:01:29
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { Markdown } from 'glipdown';
import styled from '../../../foundation/styled-components';
import { spacing, typography, palette } from '../../../foundation/utils';
import { withHighlight } from '../../../hoc/withHighlight';

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

const MarkdownWrapper = withHighlight([
  'dangerouslySetInnerHTML.__html',
])(styled.div`
  ${typography('caption1')};
  white-space: pre-wrap;
`);

type JuiIntegrationItemProps = {
  title?: string;
  body?: string;
};

const JuiIntegrationItemView = (props: JuiIntegrationItemProps) => {
  const { title, body } = props;
  if (title || body) {
    return (
      <Wrapper>
        {title && (
          <MarkdownWrapper
            data-test-automation-id="title"
            dangerouslySetInnerHTML={{ __html: Markdown(title) }}
          />
        )}
        {body && (
          <BodyWrapper>
            <MarkdownWrapper
              data-test-automation-id="body"
              dangerouslySetInnerHTML={{ __html: Markdown(body) }}
            />
          </BodyWrapper>
        )}
      </Wrapper>
    );
  }
  return null;
};

export { JuiIntegrationItemView, JuiIntegrationItemProps };
