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
        <JuiTabs defaultActiveIndex={5}>
          <JuiTab key={0} title="0Pinned">
            <div>Pinned List {id}</div>
          </JuiTab>
          <JuiTab key={1} title="1Files Files Files Files Files">
            <div>Files List {id}</div>
          </JuiTab>
          <JuiTab key={2} title="2Images">
            <div>Images List {id}</div>
          </JuiTab>
          <JuiTab key={3} title="3Tasks">
            <div>Tasks List {id}</div>
          </JuiTab>
          <JuiTab key={4} title="4Notes">
            <div>Notes List {id}</div>
          </JuiTab>
          <JuiTab key={5} title="5Events">
            <div>Events List {id}</div>
          </JuiTab>
          <JuiTab key={6} title="6Integration">
            <div>Integration List {id}</div>
          </JuiTab>
        </JuiTabs>
      </JuiRightShelf>
    );
  }
}

const RightRail = translate('translations')(RightRailComponent);

export { RightRail };
