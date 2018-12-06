import { JuiSnackbarsType } from 'jui/components/Snackbars';

type NetworkBannerProps = {};

type ConfigType = {
  shouldShow: boolean;
  message: string;
  type: JuiSnackbarsType;
};

type NetworkBannerViewProps = {
  config: ConfigType;
};

type MessageMapType = {
  [key: string]: string;
};

type ShowMapType = {
  [key: string]: boolean;
};

type TypeMapType = {
  [key: string]: JuiSnackbarsType;
};

export {
  NetworkBannerProps,
  NetworkBannerViewProps,
  MessageMapType,
  ShowMapType,
  TypeMapType,
  ConfigType,
};
