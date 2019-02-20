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
import { TeamSettingButton } from '@/containers/common/TeamSettingButton';
import { DialogContext } from '@/containers/Dialog';

@observer
class ProfileDialogGroupTitleViewComponent extends Component<
  WithNamespaces & ProfileDialogGroupTitleViewProps
> {
  static contextType = DialogContext;

  dismiss = this.context;

  render() {
    const { id, t, group } = this.props;
    return (
      <>
        <JuiDialogTitleWithActionLeft>
          {t('people.team.profile')}
        </JuiDialogTitleWithActionLeft>
        <JuiDialogTitleWithActionRight>
          <Privacy id={id} size="medium" />
          <Favorite id={id} size="medium" />
          {group.isTeam && group.isMember && (
            <TeamSettingButton id={id} size="medium" />
          )}
          {group.isTeam && <More id={id} size="medium" />}
          <JuiIconButton
            onClick={this.dismiss}
            tooltipTitle={t('common.dialog.close')}
            ariaLabel={t('common.dialog.close')}
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
