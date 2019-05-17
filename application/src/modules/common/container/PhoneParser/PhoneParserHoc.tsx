/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-04-25 13:43:10
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType } from 'react';
import { CommonPhoneLink } from './parserNumber';

function phoneParserHoc<T>(Comp: ComponentType<T>) {
  type TProps = {
    description: string;
  } & T;
  return class ComponentWithLink extends React.PureComponent<TProps> {
    render() {
      const { description = '', ...rest } = this.props;
      return React.createElement(
        Comp,
        { ...rest as T },
        <CommonPhoneLink description={description} />,
      );
    }
  };
}
export { phoneParserHoc };
