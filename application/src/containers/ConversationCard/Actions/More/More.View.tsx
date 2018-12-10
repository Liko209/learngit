/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-06 13:29:53
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ViewProps, MENU_LIST_ITEM_TYPE } from './types';
import { JuiMenuList, JuiMenuItem } from 'jui/components';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import { JuiIconButton } from 'jui/components/Buttons';

type MoreViewProps = ViewProps & WithNamespaces;

const menuItems = {
  [MENU_LIST_ITEM_TYPE.DELETE]: ({ disabled }: any) => (
    <JuiMenuItem icon="delete" disabled={disabled}>
      Delete
    </JuiMenuItem>
  ),
  [MENU_LIST_ITEM_TYPE.QUOTE]: ({ disabled }: any) => (
    <JuiMenuItem disabled={disabled}>Quote</JuiMenuItem>
  ),
  [MENU_LIST_ITEM_TYPE.EDIT]: ({ disabled }: any) => (
    <JuiMenuItem disabled={disabled}>Edit</JuiMenuItem>
  ),
}; // add more action item in menuItems

@observer
class More extends React.Component<MoreViewProps> {
  private _Anchor = () => {
    const { t } = this.props;
    return (
      <JuiIconButton
        size="small"
        variant="plain"
        data-name="actionBarMore"
        tooltipTitle={t('More')}
      >
        more_horiz
      </JuiIconButton>
    );
  }

  render() {
    const { id, permissionsMap } = this.props;

    return (
      <>
        {Object.keys(menuItems).every(
          (key: string) => permissionsMap[key].shouldDisplay,
        ) && (
          <JuiPopoverMenu
            Anchor={this._Anchor}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <JuiMenuList>
              {Object.keys(menuItems).map((key: string) => {
                const { permission, shouldDisplay } = permissionsMap[key];
                if (shouldDisplay) {
                  const Component = menuItems[key];
                  if (!permission) {
                    return (
                      <Component id={id} key={key} disabled={!permission} />
                    );
                  }
                  return <Component id={id} key={key} />;
                }
                return null;
              })}
            </JuiMenuList>
          </JuiPopoverMenu>
        )}
      </>
    );
  }
}

const MoreView = translate('Conversations')(More);

export { MoreView };
