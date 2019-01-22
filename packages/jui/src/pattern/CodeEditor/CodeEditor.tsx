/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-01-11 16:21:38
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { isEqual } from 'lodash';
import 'codemirror/lib/codemirror.css';
import styled, { createGlobalStyle } from '../../foundation/styled-components';
import { grey } from '../../foundation/utils/styles';

function normalizeLineEndings(str: string) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, '\n');
}

const StyledEditorWrapper = styled('div')<{ maxHeight: number }>`
  max-height: ${({ maxHeight }) => maxHeight}px;
  transition: max-height 0.75s ease-in-out;
`;

const OverrideDefaultStyle = createGlobalStyle<{}>`
${StyledEditorWrapper} {
  .CodeMirror {
    height: auto;
  }

  .CodeMirror-sizer {
    min-height: 0;
  }

  .CodeMirror-lines {
    background-color: ${grey('50')};
  }

  .CodeMirror-gutter{
    background-color: ${grey('200')};
  }
}
`;

type CodeMirrorOption = {
  mode?: string | object;
  lineSeparator?: string | null;
  theme?: string;
  indentUnit?: number;
  smartIndent?: boolean;
  tabSize?: number;
  indentWithTabs?: boolean;
  electricChars?: boolean;
  specialChars?: RegExp;
  direction?: 'ltr' | 'rtl';
  rtlMoveVisually?: boolean;
  keyMap?: string;
  extraKeys?: object;
  configureMouse?: Function;
  lineWrapping?: boolean;
  lineNumbers?: boolean;
  firstLineNumber?: number;
  lineNumberFormatter?: (line: number) => string;
  gutters?: string[];
  fixedGutter?: boolean;
  scrollbarStyle?: string;
  coverGutterNextToScrollbar?: boolean;
  inputStyle?: string;
  readOnly?: boolean | string;
  showCursorWhenSelecting?: boolean;
  lineWiseCopyCut?: boolean;
  pasteLinesPerSelection?: boolean;
  selectionsMayTouch?: boolean;
  undoDepth?: number;
  historyEventDelay?: number;
  tabindex?: number;
  autofocus?: boolean;
  phrases?: object;
  dragDrop?: boolean;
  allowDropFileTypes?: string[];
  cursorBlinkRate?: number;
  cursorScrollMargin?: number;
  cursorHeight?: number;
  resetSelectionOnContextMenu?: boolean;
  workTime?: number;
  workDelay?: number;
  pollInterval?: number;
  flattenSpans?: boolean;
  addModeClass?: boolean;
  maxHighlightLength?: number;
  viewportMargin?: number;
  spellcheck?: boolean;
  autocorrect?: boolean;
  autocapitalize?: boolean;
};

export type CodeEditorProp = {
  codeMirrorOption: CodeMirrorOption;
  value: string;
  mode: 'view' | 'edit';
  maxLine: number;
  collapseTo: number;
  defaultLineLimit: number;
  shouldCollapse: boolean;
  isCollapse: boolean;
  language: string;
};

export class CodeEditor extends React.Component<CodeEditorProp> {
  static defaultProps = {
    preserveScrollPosition: false,
  };

  static codeMirrorOption: {} = {
    view: {
      autofocus: false,
      autoRefresh: true,
      lineNumbers: true,
      matchBrackets: true,
      styleActiveLine: true,
      viewportMargin: Infinity,
      readOnly: true,
      cursorBlinkRate: -1,
      lineWrapping: true,
    },
    edit: {
      autofocus: false,
      autoRefresh: true,
      lineNumbers: true,
      matchBrackets: true,
      styleActiveLine: true,
    },
  };

  textareaNode: React.RefObject<any> = React.createRef();
  codeMirror: CodeMirror.EditorFromTextArea;

  async componentDidMount() {
    const defaultOption = CodeEditor.codeMirrorOption[this.props.mode];
    const options = this.props.codeMirrorOption
      ? Object.assign(defaultOption, this.props.codeMirrorOption)
      : defaultOption;

    // tslint:disable-next-line:space-in-parens
    const CodeMirror = await import(/* webpackChunkName: "codemirror" */ 'codemirror');
    this.codeMirror = CodeMirror.fromTextArea(
      this.textareaNode.current,
      options,
    );
    this.codeMirror.setValue(this.props.value || '');
  }

  shouldComponentUpdate(nextProps: CodeEditorProp) {
    if (
      this.codeMirror &&
      nextProps.value !== undefined &&
      nextProps.value !== this.props.value &&
      normalizeLineEndings(this.codeMirror.getValue()) !==
        normalizeLineEndings(nextProps.value)
    ) {
      const prevScrollPosition = this.codeMirror.getScrollInfo();
      this.codeMirror.setValue(nextProps.value);
      this.codeMirror.scrollTo(prevScrollPosition.left, prevScrollPosition.top);
    }
    if (typeof nextProps.codeMirrorOption === 'object') {
      for (const optionName in nextProps.codeMirrorOption) {
        if (
          nextProps.codeMirrorOption.hasOwnProperty(optionName) &&
          nextProps.codeMirrorOption[optionName] !== undefined
        ) {
          this.setOptionIfChanged(
            optionName,
            nextProps.codeMirrorOption[optionName],
          );
        }
      }
    }

    if (this.props.language !== nextProps.language) {
      if (nextProps.language !== 'auto') {
        const modeName = nextProps.language;
        require(`codemirror/mode/${modeName}/${modeName}.js`);
      }
    }
    return !isEqual(nextProps, this.props);
  }

  componentWillUnmount() {
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
    }
  }

  setOptionIfChanged(optionName: string, newValue: string) {
    const oldValue = this.codeMirror.getOption(optionName);
    if (!isEqual(oldValue, newValue)) {
      this.codeMirror.setOption(optionName, newValue);
    }
  }

  getCodeMirror() {
    return this.codeMirror;
  }

  focus() {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  }

  calcHeight(
    isCollapse: boolean,
    shouldCollapse: boolean,
    maxLine: number,
    collapseTo: number,
  ) {
    const editorPadding = 4;
    const lineHeight = 20;
    return shouldCollapse && isCollapse
      ? collapseTo * lineHeight + editorPadding
      : maxLine * lineHeight + editorPadding;
  }

  render() {
    const { isCollapse, shouldCollapse, maxLine, collapseTo } = this.props;
    const height = this.calcHeight(
      isCollapse,
      shouldCollapse,
      maxLine,
      collapseTo,
    );
    return (
      <>
        <StyledEditorWrapper maxHeight={height}>
          <textarea
            ref={this.textareaNode}
            defaultValue={this.props.value}
            autoComplete="off"
          />
          <OverrideDefaultStyle />
        </StyledEditorWrapper>
      </>
    );
  }
}
