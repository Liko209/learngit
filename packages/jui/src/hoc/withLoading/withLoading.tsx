/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:11:03
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType, Fragment } from 'react';
import styled from '../../foundation/styled-components';
import { JuiCircularProgress } from '../../components/Progress';
import { JuiFade } from '../../components/Fade';

type WithLoadingProps = {
  loading: boolean;
  transitionDelay?: number;
  variant?: 'circular';
};

const StyledLoading = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => `${theme.zIndex.drawer}`};
`;

const DefaultLoading = (props: any) => (
  <Fragment>
    <StyledLoading>
      <JuiFade in={props.isVisible}>
        <JuiCircularProgress />
      </JuiFade>
    </StyledLoading>
    {props.children}
  </Fragment>
);

const MAP = {
  circular: DefaultLoading,
};

const withLoading = <P extends object>(
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
        <Component {...props} />
      </Loading>
    );
  };
};

export { withLoading, WithLoadingProps };
