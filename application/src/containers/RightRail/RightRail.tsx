/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 14:35:39
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import {
  JuiRightShelf,
  JuiRightShelfHeader,
  JuiRightShelfHeaderText,
  JuiRightShelfHeaderIcon,
} from 'jui/pattern/RightShelf';
import { JuiTabs, JuiTab } from 'jui/components/Tabs';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { ItemList } from './ItemList';
import { TAB_CONFIG, TabConfig } from './ItemList/config';

type Props = {
  id: number;
  width: number;
  height: number;
} & WithNamespaces;

type TriggerButtonProps = {
  isOpen: boolean;
  onClick: () => {};
} & WithNamespaces;

// height of conversation header & tabs, pass these constant height to list;
// since resize observer in resize observer will cause UI performance issue.
const HEIGHT_CONVERSATION_HEADER = 48;
const HEIGHT_TABS = 33;
const HEIGHT_FIX = HEIGHT_CONVERSATION_HEADER + HEIGHT_TABS;
const MIN_WIDTH = 200;

class TriggerButtonComponent extends React.Component<TriggerButtonProps> {
  private _getTooltipKey = () => {
    const { isOpen } = this.props;
    return isOpen
      ? 'message.conversationDetailsHide'
      : 'message.conversationDetailsShow';
  }

  private _getIconKey = () => {
    const { isOpen } = this.props;
    return isOpen ? 'double_chevron_right' : 'double_chevron_left';
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

@observer
class RightRailComponent extends React.Component<Props> {
  state = { tabIndex: 0 };
  private _renderHeader = () => {
    const { t } = this.props;
    return (
      <JuiRightShelfHeader>
        <JuiRightShelfHeaderText>
          {t('message.conversationDetails')}
        </JuiRightShelfHeaderText>
      </JuiRightShelfHeader>
    );
  }

  private _handleTabChanged = (index: number) => {
    this.setState({ tabIndex: index });
  }

  private _renderTabs = (w: number, h: number) => {
    const { t, id } = this.props;
    const { tabIndex } = this.state;
    const width = Number.isNaN(w) ? MIN_WIDTH : w;
    const height = Number.isNaN(h) ? MIN_WIDTH : h;
    return (
      <JuiTabs
        defaultActiveIndex={0}
        tag="right-shelf"
        width={width}
        onChangeTab={this._handleTabChanged}
        moreText={t('common.more')}
      >
        {TAB_CONFIG.map(
          ({ title, type, automationID }: TabConfig, index: number) => (
            <JuiTab
              key={`${id}-${index}`}
              title={t(title)}
              automationId={`right-shelf-${automationID}`}
            >
              <ItemList
                type={type}
                groupId={id}
                width={width}
                height={height - HEIGHT_FIX}
                active={tabIndex === index}
              />
            </JuiTab>
          ),
        )}
      </JuiTabs>
    );
  }

  render() {
    const { id, width, height } = this.props;
    if (!id) {
      return null;
    }
    return (
      <JuiRightShelf data-test-automation-id="rightRail">
        {this._renderHeader()}
        {this._renderTabs(width, height)}
      </JuiRightShelf>
    );
  }
}

const RightRail = translate('translations')(RightRailComponent);
const TriggerButton = translate('translations')(TriggerButtonComponent);

export { RightRail, TriggerButton };
