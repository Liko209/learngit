/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-25 12:06:11
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ComponentType, createContext } from 'react';
import { highlightFormatter, cascadingCreate, cascadingGet } from './utils';
import _ from 'lodash';

type HighlightProps = string[];

type HighlightContextInfo = {
  keyword: string;
};

const SearchHighlightContext = createContext<HighlightContextInfo>({
  keyword: '',
});

const withHighlight = (highlightProps: HighlightProps) => <T extends object>(
  Component: ComponentType<T> | React.SFC<T>,
) => {
  class ComponentWithHighlight extends React.Component<T, {}> {
    static contextType = SearchHighlightContext;
    context: HighlightContextInfo;
    render() {
      const newProps = {};
      if (this.context.keyword && this.context.keyword.length) {
        highlightProps.forEach(propName => {
          const value = cascadingGet(this.props, propName);
          if (value) {
            const formatStr = highlightFormatter(this.context.keyword, value);
            const newPropObj = cascadingCreate(propName, formatStr);
            Object.assign(newProps, newPropObj);
          }
        });
      }
      return <Component {...this.props} {...newProps} />;
    }
  }

  return ComponentWithHighlight as any;
};

export { withHighlight, SearchHighlightContext, HighlightProps };
