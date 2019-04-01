/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiIconButton } from 'jui/components/Buttons';
import { MenuProps, MenuViewProps } from './types';
import { JuiMenuList, JuiMenuItem } from 'jui/components';
import { JuiPopoverMenu } from 'jui/pattern/PopoverMenu';
import { ConvertToTeam } from '@/containers/ConvertToTeam';

@observer
class Menu extends React.Component<
  WithTranslation & MenuProps & MenuViewProps
> {
  private _renderAnchor = () => {
    const { t } = this.props;
    return (
      <JuiIconButton
        size="medium"
        tooltipTitle={t('common.more')}
        ariaLabel={t('common.more')}
      >
        more_vert
      </JuiIconButton>
    );
  }

  private _openConvertToTeam = () => {
    const { id } = this.props;
    ConvertToTeam.show({ id });
  }

  render() {
    const { t, isGroup } = this.props;
    // Use isGroup to determine whether to display the menu,
    // Sprint 16 only one `Convert to team` menu item.
    // https://jira.ringcentral.com/browse/FIJI-3899
    return (
      isGroup && (
        <JuiPopoverMenu
          Anchor={this._renderAnchor}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <JuiMenuList>
            {isGroup && (
              <JuiMenuItem onClick={this._openConvertToTeam}>
                {t('people.team.convertToTeam')}
              </JuiMenuItem>
            )}
          </JuiMenuList>
        </JuiPopoverMenu>
      )
    );
  }
}
const MenuView = withTranslation('translations')(Menu);
export { MenuView };
