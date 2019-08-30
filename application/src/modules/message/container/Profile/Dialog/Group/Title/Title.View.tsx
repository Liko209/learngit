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
import { JuiButtonBar } from 'jui/components/Buttons';

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
          <JuiButtonBar overlapSize={2}>
            <Mute groupId={id} />
            <Privacy id={id} size="medium" analysisSource="profileDialog" />
            <Favorite
              id={id}
              size="medium"
              dataTrackingProps={{
                source: 'profileDialog',
                conversationType: group.analysisType,
              }}
            />
            {group.isMember && <TeamSettingButton id={id} size="medium" />}
            {group.isTeam && (
              <More id={id} size="medium" automationId="team-profile-more" />
            )}
            <JuiIconButton
              onClick={this.dismiss}
              tooltipTitle={t('common.dialog.close')}
              ariaLabel={t('common.dialog.close')}
            >
              close
            </JuiIconButton>
          </JuiButtonBar>
        </JuiDialogHeaderActions>
      </>
    );
  }
}

const ProfileDialogGroupTitleView = withTranslation('translations')(
  ProfileDialogGroupTitleViewComponent,
);

export { ProfileDialogGroupTitleView };
