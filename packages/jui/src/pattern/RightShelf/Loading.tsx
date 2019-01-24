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
import { palette, height, typography, grey } from '../../foundation/utils';
import {
  LoadingWrapper,
  Loading,
  Progress,
  TipLink,
} from '../ConversationLoading';
import { JuiTypography } from '../../foundation/Typography';

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

const JuiRightRailItemLoading = withTheme(RightRailLoading);

type JuiRightRailContentLoadingProps = {
  showTip?: boolean;
  tip?: string;
  linkText?: string;
  loading?: boolean;
  onClick?: () => void;
};

const JuiRightRailContentLoading = (props: JuiRightRailContentLoadingProps) => {
  return (
    <LoadingWrapper>
      <Loading>{props.loading !== false && <Progress />}</Loading>
    </LoadingWrapper>
  );
};

const Tip = styled(JuiTypography)`
  ${typography('body1')};
  text-align: center;
  color: ${grey('900')};
`;

const JuiRightRailContentLoadError = (
  props: JuiRightRailContentLoadingProps,
) => {
  return (
    <LoadingWrapper>
      <Loading>
        <Tip>
          {props.tip}
          <TipLink handleOnClick={props.onClick}>{props.linkText}</TipLink>
        </Tip>
      </Loading>
    </LoadingWrapper>
  );
};

const LoadingMoreWrapper = styled.div`
  display: flex;
  height: ${height(13)};
  width: 100%;
`;

const JuiRightRailLoadingMore = () => (
  <LoadingMoreWrapper>
    <Loading>
      <Progress />
    </Loading>
  </LoadingMoreWrapper>
);

export {
  JuiRightRailItemLoading,
  JuiRightRailContentLoading,
  JuiRightRailLoadingMore,
  JuiRightRailContentLoadError,
};
