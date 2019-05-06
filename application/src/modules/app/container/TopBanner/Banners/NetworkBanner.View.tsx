/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-05 10:08:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { JuiSnackbarContent } from 'jui/components/Snackbars';
import { observer } from 'mobx-react';
import { NetworkBannerViewProps, NetworkBannerProps } from './types';

type Props = WithTranslation & NetworkBannerProps & NetworkBannerViewProps;

@observer
class NetworkBannerComponent extends React.Component<Props> {
  render() {
    const { banner, t } = this.props;

    if (!banner) return null;

    return (
      <JuiSnackbarContent
        type={banner.type}
        message={t(banner.message)}
        messageAlign="center"
        fullWidth={true}
      />
    );
  }
}

const NetworkBannerView = withTranslation('translations')(NetworkBannerComponent);

export { NetworkBannerView };
