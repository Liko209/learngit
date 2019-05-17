/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */

type MuteProps = {
  type?: 'fab' | 'icon';
};

type MuteViewProps = {
  muteOrUnmute: () => void;
  isMute: boolean;
} & MuteProps;

export { MuteProps, MuteViewProps };
