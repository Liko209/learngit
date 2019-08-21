/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ProfileDialogGroupTitleViewProps } from './types';
import {
  JuiDialogHeaderTitle,
  JuiDialogHeaderActions,
} from 'jui/components/Dialog';
import { Favorite } from '@/containers/common/Favorite';
import { Privacy } from '@/containers/common/Privacy';
import { Mute } from '@/containers/common/Mute';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { More } from './More';
import { TeamSettingButton } from '@/containers/common/TeamSettingButton';
import { DialogContext } from '@/containers/Dialog';

@observer
class ProfileDialogGroupTitleViewComponent extends Component<
  WithTranslation & ProfileDialogGroupTitleViewProps
> {
  static contextType = DialogContext;

  dismiss = this.context;

  render() {
    const { id, t, group } = this.props;
    return (
      <>
        <JuiDialogHeaderTitle>{t('people.team.profile')}</JuiDialogHeaderTitle>
        <JuiDialogHeaderActions>
          <Mute groupId={id} />
          <Privacy id={id} size="medium" />
          <Favorite id={id} size="medium" />
          {group.isMember && <TeamSettingButton id={id} size="medium" />}
          {group.isTeam && <More id={id} size="medium" />}
          <JuiIconButton
            onClick={this.dismiss}
            tooltipTitle={t('common.dialog.close')}
            ariaLabel={t('common.dialog.close')}
          >
            close
          </JuiIconButton>
        </JuiDialogHeaderActions>
      </>
    );
  }
}

const ProfileDialogGroupTitleView = withTranslation('translations')(
  ProfileDialogGroupTitleViewComponent,
);

export { ProfileDialogGroupTitleView };
