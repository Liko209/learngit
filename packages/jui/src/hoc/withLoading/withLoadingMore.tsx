/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:11:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType, Fragment } from 'react';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils/styles';
import { JuiCircularProgress } from '../../components/Progress';

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
  return class LoadingMoreComponent extends React.Component<
    WithLoadingMoreProps
  > {
    render() {
      const { loadingTop, loadingBottom, ...rest } = this.props;
      const LoadingMore = CustomizedLoading || DefaultLoadingMore;

      return (
        <Fragment>
          {loadingTop ? <LoadingMore /> : null}
          <Component {...rest}>{rest.children}</Component>
          {loadingBottom ? <LoadingMore /> : null}
        </Fragment>
      );
    }
  };
};

export { withLoadingMore, WithLoadingMoreProps };
