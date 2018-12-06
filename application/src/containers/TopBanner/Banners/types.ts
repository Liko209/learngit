import { JuiSnackbarsType } from 'jui/components/Snackbars';

type NetworkBannerProps = {};

type BannerType = {
  message: string;
  type: JuiSnackbarsType;
};

type NetworkBannerViewProps = {
  banner: BannerType | null;
};

export { NetworkBannerProps, NetworkBannerViewProps, BannerType };
