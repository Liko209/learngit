/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-15 06:29:46
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiSubMenu, JuiMenuItem } from 'jui/components/Menus';
import JuiPresence from 'jui/components/Presence';
import { PRESENCE } from 'sdk/module/presence/constant';
import { catchError } from '@/common/catchError';
import { PresenceMenuViewProps } from './types';

type Props = PresenceMenuViewProps & WithTranslation;

@observer
class PresenceMenuViewComponent extends Component<Props> {
  @catchError.flash({
    network: 'presence.prompt.updatePresenceFailedForNetworkIssue',
    server: 'presence.prompt.updatePresenceFailedForServerIssue',
  })
  _handleMenuItemClick = (toPresence: PRESENCE) => {
    const { presence } = this.props;
    if (presence === toPresence) {
      return;
    }
  }

  render() {
    const { t, presence, title } = this.props;

    return (
      <JuiSubMenu
        title={title}
        titleIcon={(<JuiPresence presence={presence} size="medium" borderSize="small" />)}
        data-test-automation-id="presence-menu-button"
      >
        <JuiMenuItem
          automationId="presence-submenu-available"
          onClick={() => this._handleMenuItemClick(PRESENCE.AVAILABLE)}
          icon={<JuiPresence presence={PRESENCE.AVAILABLE} size="medium" borderSize="small" />}
        >
          {t('presence.available')}
        </JuiMenuItem>
        <JuiMenuItem
          automationId="presence-submenu-invisible"
          onClick={() => this._handleMenuItemClick(PRESENCE.UNAVAILABLE)}
          icon={<JuiPresence presence={PRESENCE.UNAVAILABLE} size="medium" borderSize="small" />}
        >
          {t('presence.invisible')}
        </JuiMenuItem>
        <JuiMenuItem
          automationId="presence-submenu-dnd"
          onClick={() => this._handleMenuItemClick(PRESENCE.DND)}
          icon={<JuiPresence presence={PRESENCE.DND} size="medium" borderSize="small" />}
        >
          {t('presence.doMotDisturb')}
        </JuiMenuItem>
      </JuiSubMenu>
    );
  }
}

const PresenceMenuView = withTranslation('translations')(PresenceMenuViewComponent);

export { PresenceMenuView };
