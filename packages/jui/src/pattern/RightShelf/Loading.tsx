/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-01-10 14:15:53
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { withTheme } from 'styled-components';
import ReactContentLoader from 'react-content-loader';
import styled from '../../foundation/styled-components';
import { ThemeProps } from '../../foundation/theme/theme';
import { palette } from '../../foundation/utils';

const Wrapper = styled.div`
  height: 100%;
  border-left: 1px solid ${palette('common', 'black', 1)};
`;

const RightRailLoading = (props: ThemeProps) => {
  const {
    theme: {
      size: { width, height },
    },
  } = props;
  return (
    <Wrapper>
      <ReactContentLoader
        style={{ width: '100%', height: `${67 * height}px` }}
        width={67 * width}
        height={67 * height}
      >
        <rect
          x={`${0 * width}`}
          y={`${2.5 * height}`}
          rx={width}
          ry={height}
          width={`${8 * width}`}
          height={`${8 * height}`}
        />
        <rect
          x={`${10 * width}`}
          y={`${2.5 * height}`}
          rx={width}
          ry={height}
          width={`${42 * width}`}
          height={`${4 * height}`}
        />
        <rect
          x={`${10 * width}`}
          y={`${8.5 * height}`}
          rx={width}
          ry={height}
          width={`${30 * width}`}
          height={`${2 * height}`}
        />
      </ReactContentLoader>
    </Wrapper>
  );
};

const JuiConversationRightRailLoading = withTheme(RightRailLoading);

export { JuiConversationRightRailLoading };
