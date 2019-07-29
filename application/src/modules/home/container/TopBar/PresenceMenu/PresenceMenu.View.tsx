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
import { PresenceMenuProps, PresenceMenuViewProps } from './types';

type Props = PresenceMenuViewProps & PresenceMenuProps & WithTranslation;

@observer
class PresenceMenuViewComponent extends Component<Props> {
  render() {
    const { t, presence, title, setPresence, isFreyja } = this.props;

    return (
      <JuiSubMenu
        title={title}
        titleIcon={(<JuiPresence presence={presence} size="medium" borderSize="small" />)}
        data-test-automation-id="presence-menu-button"
      >
        <JuiMenuItem
          automationId="presence-submenu-available"
          onClick={() => setPresence(PRESENCE.AVAILABLE)}
          icon={<JuiPresence presence={PRESENCE.AVAILABLE} size="medium" borderSize="small" />}
        >
          {t('presence.available')}
        </JuiMenuItem>
        <JuiMenuItem
          automationId="presence-submenu-invisible"
          onClick={() => setPresence(PRESENCE.UNAVAILABLE)}
          icon={<JuiPresence presence={PRESENCE.UNAVAILABLE} size="medium" borderSize="small" />}
        >
          {t('presence.invisible')}
        </JuiMenuItem>
        {!isFreyja && (
          <JuiMenuItem
            automationId="presence-submenu-dnd"
            onClick={() => setPresence(PRESENCE.DND)}
            icon={<JuiPresence presence={PRESENCE.DND} size="medium" borderSize="small" />}
          >
            {t('presence.doNotDisturb')}
          </JuiMenuItem>
        )}
      </JuiSubMenu>
    );
  }
}

const PresenceMenuView = withTranslation('translations')(PresenceMenuViewComponent);

export { PresenceMenuView };
