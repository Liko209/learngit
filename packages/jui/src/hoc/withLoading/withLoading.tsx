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

const StyledLoading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const DefaultLoading = () => (
  <StyledLoading>
    <JuiFade in={true} style={{ transitionDelay: '500ms' }}>
      <JuiCircularProgress />
    </JuiFade>
  </StyledLoading>
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
    if (!loading) return <Component {...props} />;

    const Loading = CustomizedLoading || MAP[variant || 'circular'];

    return <Loading transitionDelay={transitionDelay} />;
  };
};

export { withLoading, WithLoadingProps };
