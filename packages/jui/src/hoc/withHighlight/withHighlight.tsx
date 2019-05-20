/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-25 12:06:11
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ComponentType, createContext } from 'react';
import { highlightFormatter, cascadingCreate, cascadingGet } from './utils';

type HighlightProps = string[];

type HighlightContextInfo = {
  keyword: string;
};

type withHighlightProps = {
  noHighlight?: boolean;
  forwardedRef?: React.RefObject<any>;
};
const SearchHighlightContext = createContext<HighlightContextInfo>({
  keyword: '',
});

const withHighlight = (highlightProps: HighlightProps) => <P extends object>(
  Component: ComponentType<P> | React.FunctionComponent<P>,
) => {
  type Props = P & withHighlightProps;
  class ComponentWithHighlight extends React.Component<Props> {
    static contextType = SearchHighlightContext;
    context: HighlightContextInfo;
    render() {
      const newProps = {};
      if (
        !this.props.noHighlight &&
        this.context.keyword &&
        this.context.keyword.length
      ) {
        highlightProps.forEach(propName => {
          const value = cascadingGet(this.props, propName);
          if (value) {
            const formatStr = highlightFormatter(this.context.keyword, value);
            const newPropObj = cascadingCreate(propName, formatStr);
            Object.assign(newProps, newPropObj);
          }
        });
      }
      return <Component {...this.props} {...newProps} ref={this.props.forwardedRef}/>;
    }
  }
  return React.forwardRef((props: Props, ref: React.RefObject<any>) => {
    return <ComponentWithHighlight {...props} forwardedRef={ref} />;
  });
};

export { withHighlight, SearchHighlightContext, HighlightProps };
