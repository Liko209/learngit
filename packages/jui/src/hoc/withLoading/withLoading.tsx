/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:11:03
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType } from 'react';
import styled from '../../foundation/styled-components';
import { RuiCircularProgress } from 'rcui/components/Progress';
import { withDelay } from '../withDelay';
import { palette } from '../../foundation/utils';
type WithLoadingProps = {
  loading: boolean;
  variant?: 'circular';
  alwaysComponentShow?: boolean;
  delay?: number;
};

type LoaderProps = {
  size?: number;
  backgroundType?: 'mask';
};
const StyledLoadingPage = styled('div')<LoaderProps>`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0px;
  left: 0px;
  opacity: ${({ backgroundType, theme }) =>
    backgroundType ? theme.palette.action.hoverOpacity * 5 : 1};
  background: ${palette('common', 'white')};
  z-index: ${({ theme }) => theme.zIndex && theme.zIndex.loading};
`;

const DefaultLoadingWithDelay = withDelay(
  ({ backgroundType, size }: LoaderProps) => {
    return (
      <StyledLoadingPage backgroundType={backgroundType}>
        <RuiCircularProgress size={size} />
      </StyledLoadingPage>
    );
  },
);

const MAP = { circular: DefaultLoadingWithDelay };

const withLoading = <
  P extends { loading: boolean; style?: React.CSSProperties }
>(
  Component: ComponentType<P>,
  CustomizedLoading?: ComponentType<any>,
): React.SFC<P & WithLoadingProps> => {
  const CustomizedLoadingWithDelay =
    CustomizedLoading && withDelay(CustomizedLoading);
  return React.memo(
    ({
      loading,
      alwaysComponentShow = false,
      delay = 100,
      variant,
      ...props
    }: WithLoadingProps) => {
      let displayStyle = loading ? 'none' : '';
      const LoadingWithDelay =
        CustomizedLoadingWithDelay || MAP[variant || 'circular'];
      if (alwaysComponentShow) {
        displayStyle = '';
      }
      return (
        <>
          {loading ? <LoadingWithDelay delay={delay} /> : null}
          <Component
            {...props as P}
            loading={loading}
            style={{ display: displayStyle }}
          />
        </>
      );
    },
  );
};

export { withLoading, WithLoadingProps, DefaultLoadingWithDelay };
