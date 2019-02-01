/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-12-05 10:08:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import i18next from 'i18next';
import { WithNamespaces } from 'react-i18next';
import { JuiSnackbarContent } from 'jui/components/Snackbars';
import { NetworkBannerViewProps, NetworkBannerProps } from './types';

type Props = WithNamespaces & NetworkBannerProps & NetworkBannerViewProps;

class NetworkBannerView extends React.Component<Props> {
  render() {
    const { banner } = this.props;

    if (!banner) return null;

    return (
      <JuiSnackbarContent
        type={banner.type}
        message={i18next.t(banner.message)}
        messageAlign="center"
        fullWidth={true}
      />
    );
  }
}

export { NetworkBannerView };
