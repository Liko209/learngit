/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-15 06:29:46
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import {
  StyledPresenceMenu,
  StyledPresenceMenuItem,
} from 'jui/pattern/TopBar/StyledPresenceMenu';
import JuiPresence from 'jui/components/Presence';
import { PRESENCE } from 'sdk/module/presence/constant';
import { PresenceMenuProps, PresenceMenuViewProps } from './types';

type Props = PresenceMenuViewProps & PresenceMenuProps & WithTranslation;

@observer
class PresenceMenuViewComponent extends Component<Props> {
  render() {
    const { t, presence, title, setPresence, isFreyja } = this.props;

    return (
      <StyledPresenceMenu
        title={title}
        titleIcon={
          <JuiPresence presence={presence} size="medium" borderSize="small" />
        }
        data-test-automation-id="presence-menu-button"
      >
        <StyledPresenceMenuItem
          automationId="presence-submenu-available"
          onClick={() => setPresence(PRESENCE.AVAILABLE)}
          icon={
            <JuiPresence
              presence={PRESENCE.AVAILABLE}
              size="medium"
              borderSize="small"
            />
          }
        >
          {t('presence.available')}
        </StyledPresenceMenuItem>
        <StyledPresenceMenuItem
          automationId="presence-submenu-invisible"
          onClick={() => setPresence(PRESENCE.UNAVAILABLE)}
          icon={
            <JuiPresence
              presence={PRESENCE.UNAVAILABLE}
              size="medium"
              borderSize="small"
            />
          }
        >
          {t('presence.invisible')}
        </StyledPresenceMenuItem>
        {!isFreyja && (
          <StyledPresenceMenuItem
            automationId="presence-submenu-dnd"
            onClick={() => setPresence(PRESENCE.DND)}
            icon={
              <JuiPresence
                presence={PRESENCE.DND}
                size="medium"
                borderSize="small"
              />
            }
          >
            {t('presence.doNotDisturb')}
          </StyledPresenceMenuItem>
        )}
      </StyledPresenceMenu>
    );
  }
}

const PresenceMenuView = withTranslation('translations')(
  PresenceMenuViewComponent,
);

export { PresenceMenuView };
