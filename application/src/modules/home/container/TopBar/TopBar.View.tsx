/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiLogo, JuiTopBar } from 'jui/pattern/TopBar';
import { MenuListCompositionProps } from 'jui/pattern/MenuListComposition';
import { AvatarActions } from './AvatarActions';
import { NewActions } from './NewActions';
import { BackNForward } from './BackNForward';
import { SearchBar } from './SearchBar';

type TopBarProps = WithNamespaces & {
  updateLeftNavState: (event: React.MouseEvent<HTMLElement>) => void;
  brandName: string;
  currentUserId: number;
};

@observer
class TopBar extends React.Component<TopBarProps> {
  constructor(props: TopBarProps) {
    super(props);
    this._MainMenu = this._MainMenu.bind(this);
    this._Logo = this._Logo.bind(this);
  }

  private _MainMenu(mainMenuProps: MenuListCompositionProps) {
    const { updateLeftNavState, t } = this.props;
    return (
      <JuiIconButton
        tooltipTitle={t('home.menu')}
        size="medium"
        color="common.white"
        onClick={updateLeftNavState}
        data-test-automation-id="toggleBtn"
        {...mainMenuProps}
      >
        bulleted_menu
      </JuiIconButton>
    );
  }

  private _Logo() {
    const { brandName } = this.props;
    return <JuiLogo variant="headline">{brandName}</JuiLogo>;
  }

  render() {
    return (
      <React.Fragment>
        <JuiTopBar
          MainMenu={this._MainMenu}
          AvatarActions={AvatarActions}
          NewActions={NewActions}
          SearchBar={SearchBar}
          Logo={this._Logo}
          BackNForward={BackNForward}
        />
      </React.Fragment>
    );
  }
}
const TopBarView = translate('translations')(TopBar);

export { TopBarView };
