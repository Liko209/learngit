/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-06 13:29:53
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ViewProps, MENU_LIST_ITEM_TYPE } from './types';
import { JuiMenuList } from 'jui/components';
import { JuiPopperMenu } from 'jui/pattern/PopperMenu';
import { JuiIconButton } from 'jui/components/Buttons';
import { Quote } from '../Quote';
import { Delete } from '../Delete';
import { Edit } from '../Edit';

type MoreViewProps = ViewProps &
  WithNamespaces & {
    handleFocus: () => void;
    handleBlur: () => void;
    tabIndex: number;
  };

const menuItems = {
  [MENU_LIST_ITEM_TYPE.QUOTE]: Quote,
  [MENU_LIST_ITEM_TYPE.DELETE]: Delete,
  [MENU_LIST_ITEM_TYPE.EDIT]: Edit,
};

@observer
class More extends React.Component<MoreViewProps> {
  private _Anchor = () => {
    const { t, handleBlur, handleFocus, tabIndex } = this.props;
    return (
      <JuiIconButton
        size="small"
        variant="plain"
        data-name="actionBarMore"
        tooltipTitle={t('more')}
        onBlur={handleBlur}
        onFocus={handleFocus}
        tabIndex={tabIndex}
      >
        more_horiz
      </JuiIconButton>
    );
  }

  render() {
    const { id, permissionsMap, showMoreAction } = this.props;

    if (!showMoreAction) {
      return null;
    }

    return (
      <JuiPopperMenu Anchor={this._Anchor} placement="bottom-start">
        <JuiMenuList>
          {Object.keys(menuItems).map((key: string) => {
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

const MoreView = translate('Conversations')(More);

export { MoreView };
