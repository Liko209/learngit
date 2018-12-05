import { JuiSnackbarsType } from 'jui/components/Snackbars';
import { WithNamespaces } from 'react-i18next';

type NetworkBannerProps = {};

type ConfigType = {
  shouldShow: boolean;
  message: string;
  type: JuiSnackbarsType;
};

type NetworkBannerViewProps = WithNamespaces &
  NetworkBannerProps & {
    config: ConfigType;
  };

export { NetworkBannerProps, NetworkBannerViewProps };
