/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-18 9:20:21
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { JuiAvatar, TJuiAvatarProps } from 'ui-components/atoms/Avatar';
import { observer } from 'mobx-react';
import ViewModel from './ViewModel';

type TAvatarProps = TJuiAvatarProps & {
  uid: number;
};

@observer
class Avatar extends React.Component<TAvatarProps> {
  private _vm: ViewModel;
  constructor(props: TAvatarProps) {
    super(props);
    this._vm = new ViewModel(props.uid);
  }
  render() {
    const userInfo = this._vm.avatarInfo;
    const { url = '', name = '', bgColor = '' } : {url?: string, name?: string, bgColor?: string} = userInfo;
    const { innerRef, ...rest } = this.props;
    return url ? (
      <JuiAvatar src={url} {...rest} bgcolor={bgColor} />
    ) : (
      <JuiAvatar bgcolor={bgColor} {...rest}>
        {name}
      </JuiAvatar>
    );
  }
}

export { Avatar, TAvatarProps };
export default Avatar;
