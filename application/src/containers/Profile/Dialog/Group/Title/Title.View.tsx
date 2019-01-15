/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ProfileDialogGroupTitleViewProps } from './types';
import {
  JuiDialogTitleWithActionLeft,
  JuiDialogTitleWithActionRight,
} from 'jui/components/Dialog';
import { Favorite } from '@/containers/common/Favorite';
import { Privacy } from '@/containers/common/Privacy';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { More } from './More';
import portalManager from '@/common/PortalManager';
import { toTitleCase } from '@/utils/string';
import { TeamSettings } from '@/containers/TeamSettings';

@observer
class ProfileDialogGroupTitleViewComponent extends Component<
  WithNamespaces & ProfileDialogGroupTitleViewProps
> {
  dismiss = () => portalManager.dismiss();
  onClickSettingButton = () => {
    const { id } = this.props;
    portalManager.dismiss();
    TeamSettings.show(undefined, { id });
  }

  renderSettingButton() {
    const { t } = this.props;
    return (
      <JuiIconButton
        size="medium"
        color="grey.500"
        data-test-automation-id="settingButton"
        alwaysEnableTooltip={true}
        onClick={this.onClickSettingButton}
        tooltipTitle={toTitleCase(t('setting_plural'))}
      >
        settings
      </JuiIconButton>
    );
  }

  render() {
    const { id, t, group } = this.props;
    return (
      <>
        <JuiDialogTitleWithActionLeft>
          {t('profile')}
        </JuiDialogTitleWithActionLeft>
        <JuiDialogTitleWithActionRight>
          {group.isTeam && <Privacy id={id} size="medium" />}
          <Favorite id={id} size="medium" />
          {group.isTeam && this.renderSettingButton()}
          {group.isTeam && <More id={id} size="medium" />}
          <JuiIconButton
            onClick={this.dismiss}
            tooltipTitle={t('close')}
            ariaLabel={t('close')}
          >
            close
          </JuiIconButton>
        </JuiDialogTitleWithActionRight>
      </>
    );
  }
}

const ProfileDialogGroupTitleView = translate('translations')(
  ProfileDialogGroupTitleViewComponent,
);

export { ProfileDialogGroupTitleView };
