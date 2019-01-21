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
  transitionDelay?: number;
  variant?: 'circular';
};
type TStyledLoading = {
  isVisible: Boolean;
};
const StyledLoading = styled.div<TStyledLoading>`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  pointer-events: none;
  justify-content: center;
  top: 0px;
  left: 0px;
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  background: #fff;
  z-index: ${({ theme }) => theme.zIndex && theme.zIndex.loading};
`;

const DefaultLoading = (props: any) => (
  <>
    {props.children}
    <JuiFade in={props.isVisible} style={{ transitionDelay: '100ms' }}>
      <StyledLoading
        isVisible={props.isVisible}
        data-test-automation-id="loading"
      >
        <div>
          <JuiCircularProgress />
        </div>
      </StyledLoading>
    </JuiFade>
  </>
);

const MAP = {
  circular: DefaultLoading,
};

const withLoading = <P extends { loading: boolean }>(
  Component: ComponentType<P>,
  CustomizedLoading?: ComponentType<any>,
): React.SFC<P & WithLoadingProps> => {
  return ({
    loading,
    variant,
    transitionDelay = 0,
    ...props
  }: WithLoadingProps) => {
    const Loading = CustomizedLoading || MAP[variant || 'circular'];
    return (
      <Loading transitionDelay={transitionDelay} isVisible={loading}>
        <Component {...props} loading={loading} />
      </Loading>
    );
  };
};

export { withLoading, WithLoadingProps };
