/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-18 10:11:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType, RefObject } from 'react';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils/styles';
import { JuiCircularProgress } from '../../components/Progress';
import { withDelay } from '../withDelay';

type WithLoadingMoreProps = {
  loadingTop: boolean;
  loadingBottom: boolean;
  viewRef?: RefObject<any>;
  children: JSX.Element;
};

const StyledLoadingMore = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: ${spacing(15, 0)};
`;

export const DefaultLoadingMore = () => (
  <StyledLoadingMore>
    <JuiCircularProgress />
  </StyledLoadingMore>
);

const DefaultLoadingMoreWithDelay = withDelay(DefaultLoadingMore);

const withLoadingMore = (
  Component: ComponentType<any>,
  CustomizedLoading?: ComponentType<any>,
) => {
  const CustomizedLoadingWithDelay = CustomizedLoading
    ? withDelay(CustomizedLoading)
    : null;

  return class LoadingMoreComponent extends React.PureComponent<
    WithLoadingMoreProps
  > {
    render() {
      const { loadingTop, loadingBottom, ...rest } = this.props;
      const LoadingMoreWithDelay =
        CustomizedLoadingWithDelay || DefaultLoadingMoreWithDelay;
      return (
        <>
          {loadingTop ? <LoadingMoreWithDelay /> : null}
          <Component {...rest} />
          {loadingBottom ? <LoadingMoreWithDelay /> : null}
        </>
      );
    }
  };
};

export { withLoadingMore, WithLoadingMoreProps };
