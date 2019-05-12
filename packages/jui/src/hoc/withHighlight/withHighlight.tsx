/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-25 12:06:11
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ComponentType, createContext } from 'react';
import { highlightFormatter } from './utils';
import _ from 'lodash';

type HighlightProps = string[];

type HighlightContextInfo = {
  terms: string[];
};

type withHighlightProps = {
  noHighlight?: boolean;
};

const SearchHighlightContext = createContext({
  terms: [],
} as HighlightContextInfo);

const withHighlight = (highlightProps: HighlightProps) => <P extends object>(
  Component: ComponentType<P> | React.FunctionComponent<P>,
) => {
  class ComponentWithHighlight extends React.Component<P & withHighlightProps> {
    static contextType = SearchHighlightContext;
    render() {
      const newProps = {};
      if (
        !this.props.noHighlight &&
        this.context.terms &&
        this.context.terms.length
      ) {
        highlightProps.forEach(propName => {
          let thisPropsRef = this.props;
          let newPropsRef = newProps;
          let realPropName = propName;
          if (propName.indexOf('.') > 0) {
            const keys = propName.split('.');
            keys.forEach((key, index) => {
              if (index === keys.length - 1) {
                realPropName = key;
              } else {
                thisPropsRef = thisPropsRef[key] || {};
                newPropsRef = newPropsRef[key] || {};
              }
            });
          }
          const value = thisPropsRef[propName];
          value &&
            (newPropsRef[realPropName] = highlightFormatter(
              this.context.terms,
              value,
            ));
        });
      }
      return <Component {...this.props} {...newProps} />;
    }
  }

  return ComponentWithHighlight;
};

export { withHighlight, SearchHighlightContext, HighlightProps };
