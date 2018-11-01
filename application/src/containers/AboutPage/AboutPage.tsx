/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-31 14:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { JuiModal } from 'jui/components/Dialog';
import { grey } from 'jui/foundation/utils/styles';
import styled from 'jui/foundation/styled-components';
import { gitCommitInfo } from '@/containers/VersionInfo/commitInfo';
import { formatDate } from '@/containers/VersionInfo/LoginVersionStatus';
import pkg from '../../../package.json';

type Props = WithNamespaces & {
  appVersion: string;
  electronVersion: string;
  isShowDialog: boolean;
  handleAboutPage: (event: React.MouseEvent<HTMLElement>) => void;
};
const Param = styled.p`
  color: ${grey('700')};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;
class AboutPage extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const {
      isShowDialog,
      electronVersion,
      appVersion,
      handleAboutPage,
      t,
    } = this.props;
    const commitHash = gitCommitInfo.commitInfo[0].commitHash;
    return (
      <JuiModal
        open={isShowDialog}
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
