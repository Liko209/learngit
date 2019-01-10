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

  render() {
    const { id, t } = this.props;
    if (!id) {
      return null;
    }
    return (
      <JuiRightShelf data-test-automation-id="rightRail">
        <JuiRightShelfHeader>
          <JuiRightShelfHeaderText>
            {t('conversationDetails')} {id}
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
        <JuiTabs defaultActiveIndex={0} tag="rightShelf">
          <JuiTab title={t('pinned')}>
            <div>Pinned List</div>
          </JuiTab>
          <JuiTab title={t('files')}>
            <div>Files List</div>
          </JuiTab>
          <JuiTab title={t('images')}>
            <div>Images List</div>
          </JuiTab>
          <JuiTab title={t('tasks')}>
            <div>Tasks List</div>
          </JuiTab>
          <JuiTab title={t('links')}>
            <div>Links List</div>
          </JuiTab>
          <JuiTab title={t('notes')}>
            <div>Notes List</div>
          </JuiTab>
          <JuiTab title={t('events')}>
            <div>Events List</div>
          </JuiTab>
          <JuiTab title={t('integrations')}>
            <div>Integrations List</div>
          </JuiTab>
        </JuiTabs>
      </JuiRightShelf>
    );
  }
}

const RightRail = translate('translations')(RightRailComponent);

export { RightRail };
