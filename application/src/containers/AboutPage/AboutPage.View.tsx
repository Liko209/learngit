/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-31 14:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiModal } from 'jui/components/Dialog';
import pkg from '../../../package.json';
import { grey } from 'jui/foundation/utils/styles';
import styled from 'jui/foundation/styled-components';
import { gitCommitInfo } from '@/containers/VersionInfo/commitInfo';
import { formatDate } from '@/containers/VersionInfo/LoginVersionStatus';
// import { TranslationFunction } from 'i18next';

type Props = WithNamespaces & {
  handleAboutPage: (event: React.MouseEvent<HTMLElement>) => void;
  dialogStatus: boolean;
  electronVersion: number;
  appVersion: number;
  // t: TranslationFunction;
};
const Param = styled.p`
  color: ${grey('700')};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;
@observer
class AboutPage extends Component<Props> {
  render() {
    const {
      dialogStatus,
      t,
      handleAboutPage,
      electronVersion,
      appVersion,
    } = this.props;
    const commitHash = gitCommitInfo.commitInfo[0].commitHash;
    console.log('dialogStatus', dialogStatus);
    return (
      <JuiModal
        open={dialogStatus}
        title={t('About RingCentral')}
        okText={t('Done')}
        onOK={handleAboutPage}
      >
        <Param>
          Version: {appVersion ? appVersion : pkg.version}{' '}
          {electronVersion ? `(E. ${electronVersion})` : null}
        </Param>
        <Param>Last Commit: {commitHash}</Param>
        <Param>Build Time: {formatDate(process.env.BUILD_TIME || '')}</Param>
        <Param>
          Copyright © 1999-
          {new Date().getFullYear()} RingCentral, Inc. All rights reserved.
        </Param>
      </JuiModal>
    );
  }
}

const AboutPageView = translate('translations')(AboutPage);

export { AboutPageView };
