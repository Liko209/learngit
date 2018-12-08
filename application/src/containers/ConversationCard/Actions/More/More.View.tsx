/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-06 13:29:53
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ViewProps } from './types';
import { JuiMenuList } from 'jui/components';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import { JuiIconButton } from 'jui/components/Buttons';

type MoreViewProps = ViewProps & WithNamespaces;

const menuItems = {}; // add more action item in menuItems

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
        {Object.keys(menuItems).length > 0 && (
          <JuiMenuList>
            {Object.keys(menuItems).map((key: string) => {
              const hasPermission = permissionsMap[key];
              if (hasPermission) {
                const Component = menuItems[key];
                return <Component id={id} key={key} />;
              }
              return null;
            })}
          </JuiMenuList>
        )}
      </JuiPopoverMenu>
    );
  }
}

const MoreView = translate('Conversations')(More);

export { MoreView };
