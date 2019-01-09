/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 14:35:39
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import {
  JuiRightShelf,
  JuiRightShelfHeader,
  JuiRightShelfHeaderText,
  JuiRightShelfHeaderIcon,
} from 'jui/pattern/RightShelf';
import { JuiTabs, JuiTab } from 'jui/components/Tabs';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import ReactResizeDetector from 'react-resize-detector';

type States = {
  isOpen: boolean;
};

type Props = {
  id: number;
} & WithNamespaces;

class RightRailComponent extends React.Component<Props, States> {
  state = {
    isOpen: true,
  };

  handleExpandAndCollapse = () => {
    this.setState((prevState: States) => ({
      isOpen: !prevState.isOpen,
    }));
  }

  private _getTooltipKey = () => {
    const { isOpen } = this.state;
    return isOpen ? 'conversationDetailsHide' : 'conversationDetailsShow';
  }

  private _getIconKey = () => {
    const { isOpen } = this.state;
    return isOpen ? 'chevron_right' : 'chevron_left';
  }

  private _renderHeader = () => {
    const { t } = this.props;
    return (
      <JuiRightShelfHeader>
        <JuiRightShelfHeaderText>
          {t('conversationDetails')}
        </JuiRightShelfHeaderText>
        <JuiRightShelfHeaderIcon>
          <JuiIconButton
            tooltipTitle={t(this._getTooltipKey())}
            ariaLabel={t(this._getTooltipKey())}
            onClick={this.handleExpandAndCollapse}
          >
            {this._getIconKey()}
          </JuiIconButton>
        </JuiRightShelfHeaderIcon>
      </JuiRightShelfHeader>
    );
  }

  private _renderTabs = () => {
    const { t } = this.props;
    return (
      <ReactResizeDetector handleWidth={true}>
        {(width: number) => (
          <JuiTabs defaultActiveIndex={0} width={width}>
            <JuiTab key={0} title={t('pinned')}>
              <div>Pinned List</div>
            </JuiTab>
            <JuiTab key={1} title={t('files')}>
              <div>Files List</div>
            </JuiTab>
            <JuiTab key={2} title={t('images')}>
              <div>Images List</div>
            </JuiTab>
            <JuiTab key={4} title={t('tasks')}>
              <div>Tasks List</div>
            </JuiTab>
            <JuiTab key={3} title={t('links')}>
              <div>Links List</div>
            </JuiTab>
            <JuiTab key={5} title={t('notes')}>
              <div>Notes List</div>
            </JuiTab>
            <JuiTab key={6} title={t('events')}>
              <div>Events List</div>
            </JuiTab>
            <JuiTab key={7} title={t('integrations')}>
              <div>Integrations List</div>
            </JuiTab>
          </JuiTabs>
        )}
      </ReactResizeDetector>
    );
  }

  render() {
    const { id } = this.props;
    if (!id) {
      return null;
    }
    return (
      <JuiRightShelf data-test-automation-id="rightRail">
        {this._renderHeader()}
        {this._renderTabs()}
      </JuiRightShelf>
    );
  }
}

const RightRail = translate('translations')(RightRailComponent);

export { RightRail };
