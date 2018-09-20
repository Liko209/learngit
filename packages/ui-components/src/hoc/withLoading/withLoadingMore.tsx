/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:11:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType, Fragment } from 'react';
import styled from '../../styled-components';
import { spacing } from '../../utils/styles';
import { JuiCircularProgress } from '../../atoms/CircularProgress';
import { JuiFade } from '../../atoms/Fade';

type WithLoadingMoreProps = {
  loadingTop: boolean;
  loadingBottom: boolean;
  children: JSX.Element;
};

const StyledLoadingMore = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: ${spacing(15, 0)};
`;

const DefaultLoadingMore = () => (
  <StyledLoadingMore>
    <JuiCircularProgress />
  </StyledLoadingMore>
);

const withLoadingMore = (
  Component: ComponentType<any>,
  CustomizedLoading?: ComponentType<any>,
) => {
  return class LoadingMoreComponent extends React.Component<any> {
    render() {
      const { loadingTop, loadingBottom, delay = 0, ...rest } = this.props;
      const LoadingMore = CustomizedLoading || DefaultLoadingMore;

      const DelayedLoading = () => (
        <JuiFade in={true} style={{ transitionDelay: `${delay}ms` }}>
          <LoadingMore />
        </JuiFade>
      );

      return (
        <Fragment>
          {loadingTop ? <DelayedLoading /> : null}
          <Component {...rest}>{rest.children}</Component>
          {loadingBottom ? <DelayedLoading /> : null}
        </Fragment>
      );
    }
  };
};

export { withLoadingMore, WithLoadingMoreProps };
