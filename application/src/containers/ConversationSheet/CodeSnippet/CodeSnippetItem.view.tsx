/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-01-16 17:32:18
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiCodeSnippetBody } from 'jui/pattern/ConversationItemCard/ConversationItemCardBody';
import { JuiConversationItemCard } from 'jui/pattern/ConversationItemCard';
import { CodeEditor } from 'jui/pattern/CodeEditor';
import { CodeSnippetViewProps } from './types';
import { memoize } from 'lodash';
import copy from 'copy-to-clipboard';

const DEFAULT_LINE_LIMIT = 15;
const COLLAPSE_TO = 10;
const MAX_EDITOR_LINES = 200;
export class CodeSnippetView extends React.Component<CodeSnippetViewProps> {
  state = {
    showHeaderActions: false,
    isCollapse: true,
    showHoverAction: false,
  };

  handleCopy = () => {
    copy(this.props.postItem.body);
  }

  handleDownload = () => {
    const link = document.createElement('a');
    link.download = `${this.props.postItem.title}.txt`;
    const blob = new Blob([this.props.postItem.body], { type: 'text/plain' });
    link.href = window.URL.createObjectURL(blob);
    link.click();
  }

  _getHeaderActions = memoize(() => {
    return [
      {
        iconName: 'copy',
        tooltip: 'copy',
        handler: this.handleCopy,
      },
      {
        iconName: 'download',
        tooltip: 'download',
        handler: this.handleDownload,
      },
    ];
  });

  _getHoverActions = (
    collapsed: boolean,
    showDownload: boolean,
    restLines: number,
  ) => {
    const actions = [];
    if (collapsed) {
      actions.push({
        text: 'expand',
        handler: this.handleExpand,
      });
    } else {
      actions.push({
        text: 'collapse',
        handler: this.handleCollapse,
      });
    }

    if (!collapsed && showDownload) {
      actions.push({
        text: `Download to see the rest ${restLines} lines`,
        handler: this.handleDownload,
      });
    }

    return actions;
  }

  handleMouseEnter = () => {
    this.setState({ showHeaderActions: true, showHoverAction: true });
  }

  handleMouseLeave = () => {
    this.setState({ showHeaderActions: false, showHoverAction: false });
  }

  handleExpand = () => {
    this.setState({ isCollapse: false });
  }

  handleCollapse = () => {
    this.setState({ isCollapse: true });
  }

  calcTotalLines = (content: string) => {
    return (content.match(/\r?\n/g) || '').length + 1;
  }

  render() {
    const { title, body = '', mode: language, mimeType } = this.props.postItem;
    const lineNumber = this.calcTotalLines(body);
    const showHoverAction =
      lineNumber > DEFAULT_LINE_LIMIT && this.state.showHoverAction;
    const showDownloadButton = lineNumber > MAX_EDITOR_LINES;
    const restLines = lineNumber - MAX_EDITOR_LINES;

    return (
      <JuiConversationItemCard
        Icon="code"
        title={title}
        contentHasPadding={false}
        headerActions={this._getHeaderActions()}
        showHeaderActions={this.state.showHeaderActions}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <JuiCodeSnippetBody
          hoverActions={
            showHoverAction
              ? this._getHoverActions(
                  this.state.isCollapse,
                  showDownloadButton,
                  restLines,
                )
              : []
          }
        >
          <CodeEditor
            value={body}
            mode="view"
            maxLine={MAX_EDITOR_LINES}
            collapseTo={COLLAPSE_TO}
            defaultLineLimit={DEFAULT_LINE_LIMIT}
            isCollapse={this.state.isCollapse}
            language={language}
            codeMirrorOption={{
              mode: mimeType,
            }}
          />
        </JuiCodeSnippetBody>
      </JuiConversationItemCard>
    );
  }
}
