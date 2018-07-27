/*
 * @Author: Andy Hu
 * @Date: 2018-06-14 23:10:58
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { findAll } from './utils.ts';
import styled from 'styled-components';
const highlightParserBuilder = ({
  query,
  highlightClassName,
  highlightTag: HighlightTag = 'span'
}) => {
  return htmlToHighlight => {
    const queries = query.trim().split(' ');
    const chunks = findAll(htmlToHighlight, queries);
    return chunks
      .map((chunk, index) => {
        const text = htmlToHighlight.substr(
          chunk.start,
          chunk.end - chunk.start
        );
        return chunk.highlight
          ? `<${HighlightTag} class='${highlightClassName}'>${text}</${HighlightTag}>`
          : text;
      })
      .join('');
  };
};

const Highlight = ({
  query,
  highlightTag = 'span',
  highlightClassName = 'highlight',
  component: Component
}) => {
  const Highlighter = styled(Component)`
    .${highlightClassName} {
      background-color: #ee4;
      box-shadow: rgba(0, 0, 0, 0.25) 0 2px 10px;
      border: 1px solid #dc2;
      border-radius: 5px;
      padding: 2px 7px;
      margin: -3px -8px -3px -8px;
      margin: -3px 1px -3px 1px;
      display: inline-block;
      position: relative;
    }
  `;
  const highlightParser = highlightParserBuilder({
    query,
    highlightTag,
    highlightClassName
  });
  const wrappedComponent = props => {
    return <Highlighter {...props} highlightParser={highlightParser} />;
  };

  return wrappedComponent;
};

export default Highlight;
