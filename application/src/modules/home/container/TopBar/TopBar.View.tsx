/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiLogo, JuiTopBar } from 'jui/pattern/TopBar';
import { MenuListCompositionProps } from 'jui/pattern/MenuListComposition';
import { AvatarActions } from './AvatarActions';
import { NewActions } from './NewActions';
import { BackNForward } from './BackNForward';
import { container } from 'framework/ioc';
import { HomeStore } from '@/modules/home/store';

type TopBarProps = WithTranslation & {
  updateLeftNavState: (event: React.MouseEvent<HTMLElement>) => void;
  brandName: string;
  currentUserId: number;
  openGlobalSearch: (event: React.MouseEvent<HTMLElement>) => void;
  searchKey: string;
  onClear: () => void;
};

@observer
class TopBar extends React.Component<TopBarProps> {
  private _homeStore: HomeStore = container.get(HomeStore);

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
        size="large"
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
    return <JuiLogo>{brandName}</JuiLogo>;
  }

  render() {
    const { openGlobalSearch, searchKey, onClear, t } = this.props;

    return (
      <JuiTopBar
        MainMenu={this._MainMenu}
        AvatarActions={AvatarActions}
        NewActions={NewActions}
        Logo={this._Logo}
        BackNForward={BackNForward}
        openGlobalSearch={openGlobalSearch}
        searchKey={searchKey}
        searchPlaceholder={t('globalSearch.search')}
        onClear={onClear}
        Dialpad={
          this._homeStore.extensions.topBar
            ? [...this._homeStore.extensions.topBar][0]
            : undefined
        }
      />
    );
  }
}
const TopBarView = withTranslation('translations')(TopBar);

export { TopBarView };
