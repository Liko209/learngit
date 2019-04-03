/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-06 08:56:08
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { withTheme } from 'styled-components';
import ReactContentLoader from 'react-content-loader';
import styled from '../../foundation/styled-components';
import { ThemeProps } from '../../foundation/theme/theme';
import { palette, grey } from '../../foundation/utils';

const Wrapper = styled.div`
  height: 100%;
  background: ${grey('50')};
  border-left: 1px solid ${palette('common', 'black', 1)};
`;

const RightRailLoading = React.memo((props: ThemeProps) => {
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
          x={`${4 * width}`}
          y={`${2.5 * height}`}
          rx={width}
          ry={height}
          width={`${42 * width}`}
          height={`${7 * height}`}
        />
        <rect
          x={`${4 * width}`}
          y={`${14.5 * height}`}
          rx={width}
          ry={height}
          width={`${57 * width}`}
          height={`${6 * height}`}
        />
        <circle
          cx={`${8 * width}`}
          cy={`${29.5 * height}`}
          r={`${4 * width}`}
        />
        <circle
          cx={`${20 * width}`}
          cy={`${29.5 * height}`}
          r={`${4 * width}`}
        />
        <circle
          cx={`${32 * height}`}
          cy={`${29.5 * height}`}
          r={`${4 * width}`}
        />
      </ReactContentLoader>
    </Wrapper>
  );
});

const JuiRightRailLoading = withTheme(RightRailLoading);

export { JuiRightRailLoading };
