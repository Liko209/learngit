/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
// import { JuiHorizMenu } from 'jui/pattern/GroupTeamProfile';
import { JuiIconButton } from 'jui/components/Buttons';
// import copy from 'copy-to-clipboard';
// import { accessHandler } from '../../AccessHandler';
import { MoreViewProps } from './types';

@observer
class More extends React.Component<WithNamespaces & MoreViewProps> {
  render() {
    const { t } = this.props;
    // if (!isTeam) {
    //   return null;
    // }
    return (
      <JuiIconButton
        variant="plain"
        size="medium"
        tooltipTitle={t('more')}
        ariaLabel={t('checkMoreTeamOption')}
      >
        more_horiz
      </JuiIconButton>
    );
  }
}
const MoreView = translate('translations')(More);
export { MoreView };
