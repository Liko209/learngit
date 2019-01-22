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
import { translate, WithNamespaces } from 'react-i18next';

const DEFAULT_LINE_LIMIT = 15;
const COLLAPSE_TO = 10;
const MAX_EDITOR_LINES = 200;

class CodeSnippet extends React.Component<
  WithNamespaces & CodeSnippetViewProps
> {
  state = {
    showHeaderActions: false,
    isCollapse: true,
    hover: false,
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
    const { t } = this.props;
    return [
      {
        iconName: 'copy',
        tooltip: t('copy'),
        handler: this.handleCopy,
      },
      {
        iconName: 'download',
        tooltip: t('download'),
        handler: this.handleDownload,
      },
    ];
  });

  _getHoverActions = (
    collapsed: boolean,
    showDownload: boolean,
    restLines: number,
  ) => {
    const { t } = this.props;
    const actions = [];

    if (collapsed) {
      actions.push({
        text: t('expand'),
        handler: this.handleExpand,
      });
    } else {
      actions.push({
        text: t('collapse'),
        handler: this.handleCollapse,
      });
    }

    if (!collapsed && showDownload) {
      actions.push({
        text: t('DownloadToSeeTheRestLine', { restLines }),
        handler: this.handleDownload,
      });
    }

    return actions;
  }

  handleMouseEnter = () => {
    this.setState({ showHeaderActions: true, hover: true });
  }

  handleMouseLeave = () => {
    this.setState({ showHeaderActions: false, hover: false });
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
    const showHoverAction = lineNumber > DEFAULT_LINE_LIMIT && this.state.hover;
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
            shouldCollapse={lineNumber > DEFAULT_LINE_LIMIT}
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

const CodeSnippetView = translate('translations')(CodeSnippet);
export { CodeSnippetView };
