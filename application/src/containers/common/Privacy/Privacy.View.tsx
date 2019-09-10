/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { PrivacyViewProps, PrivacyProps } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { catchError } from '@/common/catchError';
import { analyticsCollector } from '@/AnalyticsCollector';

type Props = PrivacyViewProps & WithTranslation & PrivacyProps;

@observer
class PrivacyViewComponent extends Component<Props> {
  @catchError.flash({
    network: 'people.prompt.changeTeamPrivateTypeErrorForNetworkIssue',
    server: 'people.prompt.changeTeamPrivateTypeErrorForServerIssue',
  })
  onClickPrivacy = async () => {
    const { handlePrivacy, isPublic, analysisSource } = this.props;
    analyticsCollector.toggleTeamVisibility(
      isPublic ? 'publicToPrivate' : 'privateToPublic',
      analysisSource,
    );
    await handlePrivacy();
  };

  getTipText = () => {
    const { isPublic, isAdmin } = this.props;
    if (isAdmin) {
      return isPublic
        ? 'people.team.changeToPrivate'
        : 'people.team.changeToPublic';
    }
    return isPublic ? 'people.team.publicTeam' : 'people.team.privateTeam';
  };

  render() {
    const { isPublic, size, t, isAdmin, isTeam } = this.props;
    if (!isTeam) {
      return null;
    }
    const tooltipKey = this.getTipText();
    return (
      <JuiIconButton
        size={size}
        color="grey.500"
        className="privacy"
        disabled={!isAdmin}
        alwaysEnableTooltip
        onClick={this.onClickPrivacy}
        tooltipTitle={t(tooltipKey)}
        data-test-automation-id={
          isPublic ? 'privacy-is-public' : 'privacy-is-private'
        }
      >
        {isPublic ? 'lock_open' : 'lock'}
      </JuiIconButton>
    );
  }
}

const PrivacyView = withTranslation('translations')(PrivacyViewComponent);

export { PrivacyView };
