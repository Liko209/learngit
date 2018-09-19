/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { JuiAvatar, TJuiAvatarProps } from 'ui-components/atoms/Avatar';
import { observer } from 'mobx-react';
import ViewModel from './ViewModel';
import styled from 'styled-components';

type TAvatarProps = TJuiAvatarProps & {
  uId: number;
};
type TJuiAvatar = {
  bgColor?: string;
  src?: string;
};
const CustomJuiAvatar: React.SFC<TJuiAvatar> = ({ bgColor, ...props }) => {
  return <JuiAvatar {...props} />;
};
const StyleAvatar = styled<TJuiAvatar>(CustomJuiAvatar)`
  && {
    background-color: ${({ theme, bgColor }) => (bgColor ? theme.avatar[bgColor] : '')};
  }
`;

@observer
class Avatar extends React.Component<TAvatarProps> {
  private _vm: ViewModel;
  constructor(props: TAvatarProps) {
    super(props);
    this._vm = new ViewModel();
  }
  render() {
    const { uId } = this.props;
    this._vm.getPersonInfo(uId);
    const userInfo = this._vm.handleAvatar();
    const avatar = userInfo.url ? userInfo.url : '';
    const name = userInfo.name ? userInfo.name : '';
    const color = userInfo.bgColor ? userInfo.bgColor : '';
    return avatar ? <StyleAvatar src={avatar} /> : <StyleAvatar bgColor={color}>{name}</StyleAvatar>;
  }
}

export { Avatar, TAvatarProps };
export default Avatar;
