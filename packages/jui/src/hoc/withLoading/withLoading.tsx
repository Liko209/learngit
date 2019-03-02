/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:11:03
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType } from 'react';
import styled from '../../foundation/styled-components';
import { JuiCircularProgress } from '../../components/Progress';
import { withDelay } from '../withDelay';

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
  justify-content: center;
  top: 0px;
  left: 0px;
  background: #fff;
  z-index: ${({ theme }) => theme.zIndex && theme.zIndex.loading};
`;

const DefaultLoadingWithDelay = withDelay(() => (
  <StyledLoadingPage>
    <JuiCircularProgress />
  </StyledLoadingPage>
));

const MAP = { circular: DefaultLoadingWithDelay };

const withLoading = <
  P extends { loading: boolean; style?: React.CSSProperties }
>(
  Component: ComponentType<P>,
  CustomizedLoading?: ComponentType<any>,
): React.SFC<P & WithLoadingProps> => {
  const CustomizedLoadingWithDelay =
    CustomizedLoading && withDelay(CustomizedLoading);

  return React.memo(({ loading, variant, ...props }: WithLoadingProps) => {
    const LoadingWithDelay =
      CustomizedLoadingWithDelay || MAP[variant || 'circular'];

    return (
      <>
        {loading ? <LoadingWithDelay delay={100} /> : null}
        <Component
          {...props as P}
          loading={loading}
          style={{ display: loading ? 'none' : '' }}
        />
      </>
    );
  });
};

export { withLoading, WithLoadingProps };
