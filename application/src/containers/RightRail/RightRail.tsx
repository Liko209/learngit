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

type Props = {
  id: number;
} & WithNamespaces;

type TriggerButtonProps = {
  isOpen: boolean;
  onClick: () => {};
} & WithNamespaces;

class TriggerButtonComponent extends React.Component<TriggerButtonProps> {
  private _getTooltipKey = () => {
    const { isOpen } = this.props;
    return isOpen ? 'conversationDetailsHide' : 'conversationDetailsShow';
  }

  private _getIconKey = () => {
    const { isOpen } = this.props;
    return isOpen ? 'chevron_right' : 'chevron_left';
  }

  render() {
    const { t, onClick } = this.props;
    return (
      <JuiRightShelfHeaderIcon>
        <JuiIconButton
          tooltipTitle={t(this._getTooltipKey())}
          ariaLabel={t(this._getTooltipKey())}
          onClick={onClick}
        >
          {this._getIconKey()}
        </JuiIconButton>
      </JuiRightShelfHeaderIcon>
    );
  }
}

class RightRailComponent extends React.Component<Props> {
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
        </JuiRightShelfHeader>
        <JuiTabs defaultActiveIndex={0}>
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
      </JuiRightShelf>
    );
  }
}

const RightRail = translate('translations')(RightRailComponent);
const TriggerButton = translate('translations')(TriggerButtonComponent);

export { RightRail, TriggerButton };
