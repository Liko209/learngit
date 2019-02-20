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
import { ItemList, RIGHT_RAIL_ITEM_TYPE } from './ItemList';
import { TAB_CONFIG, TabConfig } from './ItemList/config';
import ReactResizeDetector from 'react-resize-detector';
import { PinnedList } from './PinnedList';

type Props = {
  id: number;
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

  private _renderListView = (
    type: RIGHT_RAIL_ITEM_TYPE,
    id: number,
    active: boolean,
    width: number,
    height: number,
  ) => {
    if (type === RIGHT_RAIL_ITEM_TYPE.PIN_POSTS) {
      return <PinnedList groupId={id} />;
    }
    return (
      <ItemList
        type={type}
        groupId={id}
        active={active}
        width={width}
        height={height}
      />
    );
  }

  private _renderTabs = () => {
    const { t, id } = this.props;
    const { tabIndex } = this.state;
    return (
      <ReactResizeDetector handleWidth={true} handleHeight={true}>
        {(width: number, height: number) => (
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
                  key={index}
                  title={t(title)}
                  automationId={`right-shelf-${automationID}`}
                >
                  {this._renderListView(
                    type,
                    id,
                    tabIndex === index,
                    width,
                    height - HEIGHT_FIX,
                  )}
                </JuiTab>
              ),
            )}
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
const TriggerButton = translate('translations')(TriggerButtonComponent);

export { RightRail, TriggerButton };
