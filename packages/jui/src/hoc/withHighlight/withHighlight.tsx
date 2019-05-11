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
  terms: string[];
};

const SearchHighlightContext = createContext({
  terms: [],
} as HighlightContextInfo);

const withHighlight = (highlightProps: HighlightProps) => (
  Component: ComponentType<any> | React.SFC<any>,
) => {
  class ComponentWithHighlight extends React.Component {
    static contextType = SearchHighlightContext;
    render() {
      const newProps = {};
      if (this.context.terms && this.context.terms.length) {
        highlightProps.forEach(propName => {
          const value = cascadingGet(this.props, propName);
          if (value) {
            const formatStr = highlightFormatter(this.context.terms, value);
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
