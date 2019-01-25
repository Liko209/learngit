/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:11:03
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType } from 'react';
import styled from '../../foundation/styled-components';
import { JuiCircularProgress } from '../../components/Progress';
import { JuiFade } from '../../components/Fade';

type WithLoadingProps = {
  loading: boolean;
  variant?: 'circular';
};

const StyledLoadingPage = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  pointer-events: none;
  justify-content: center;
  top: 0px;
  left: 0px;
  background: #fff;
  z-index: ${({ theme }) => theme.zIndex && theme.zIndex.loading};
`;

const DefaultLoading = () => (
  <StyledLoadingPage>
    <JuiCircularProgress />
  </StyledLoadingPage>
);

const MAP = { circular: DefaultLoading };
const FADE_STYLE = { transitionDelay: '100ms' };

const withLoading = <
  P extends { loading: boolean; style?: React.CSSProperties }
>(
  Component: ComponentType<P>,
  CustomizedLoading?: ComponentType<any>,
): React.SFC<P & WithLoadingProps> => {
  return ({ loading, variant, ...props }: WithLoadingProps) => {
    const Loading = CustomizedLoading || MAP[variant || 'circular'];
    return (
      <>
        {loading && (
          <JuiFade in={true} style={FADE_STYLE}>
            <Loading />
          </JuiFade>
        )}
        <Component
          {...props}
          loading={loading}
          style={{ display: loading ? 'none' : '' }}
        />
      </>
    );
  };
};

export { withLoading, WithLoadingProps };
