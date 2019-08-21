/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-06 13:29:53
 * Copyright © RingCentral. All rights reserved.
 */
import React, { MouseEvent } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ViewProps, MENU_LIST_ITEM_TYPE } from './types';
import { JuiMenuList } from 'jui/components/Menus';
import { JuiPopperMenu, AnchorProps } from 'jui/pattern/PopperMenu';
import { JuiIconButton } from 'jui/components/Buttons';
import { Quote } from '../Quote';
import { Delete } from '../Delete';
import { Edit } from '../Edit';

type MoreViewProps = ViewProps & WithTranslation;
type State = { open: boolean; anchorEl: EventTarget & Element | null };

const menuItems = {
  [MENU_LIST_ITEM_TYPE.QUOTE]: Quote,
  [MENU_LIST_ITEM_TYPE.EDIT]: Edit,
  [MENU_LIST_ITEM_TYPE.DELETE]: Delete,
};

@observer
class More extends React.Component<MoreViewProps, State> {
  state = {
    open: false,
    anchorEl: null,
  };
  private _Anchor = ({ tooltipForceHide }: AnchorProps) => {
    const { t } = this.props;
    return (
      <JuiIconButton
        size="small"
        variant="plain"
        data-name="actionBarMore"
        tooltipTitle={t('common.more')}
        tooltipForceHide={tooltipForceHide}
        onClick={this.openPopper}
      >
        more_horiz
      </JuiIconButton>
    );
  }

  openPopper = (evt: MouseEvent) => {
    const { currentTarget } = evt;
    this.setState(state => ({
      anchorEl: currentTarget,
      open: !state.open,
    }));
  }

  closePopper = () => {
    this.setState({
      open: false,
    });
  }

  render() {
    const { anchorEl, open } = this.state;
    const { id, permissionsMap, showMoreAction } = this.props;

    if (!showMoreAction) {
      return null;
    }

    return (
      <JuiPopperMenu
        open={open}
        anchorEl={anchorEl}
        Anchor={this._Anchor}
        placement="bottom-start"
        onClose={this.closePopper}
      >
        <JuiMenuList onClick={this.closePopper}>
          {Object.keys(menuItems)
            .sort((a: string, b: string) => Number(a) - Number(b))
            .map((key: string) => {
              const { permission, shouldShowAction } = permissionsMap[key];
              const Component = menuItems[key];
              return (
                shouldShowAction && (
                  <Component id={id} key={key} disabled={!permission} />
                )
              );
            })}
        </JuiMenuList>
      </JuiPopperMenu>
    );
  }
}

const MoreView = withTranslation('translations')(More);

export { MoreView };
