import * as React from 'react';
import { JuiAvatar, TJuiAvatarProps } from 'ui-components/atoms/Avatar';
import { observer } from 'mobx-react';
import ViewModel from './ViewModel';

type TAvatarProps = TJuiAvatarProps & {
  uId: number;
};

@observer
class Avatar extends React.Component<TAvatarProps, {}> {
  private _vm: ViewModel;
  constructor(props: TAvatarProps) {
    super(props);
    this._vm = new ViewModel();
  }
  componentDidMount() {
    const { uId } = this.props;
    this._vm.getPersonInfo(uId);
  }
  render() {
    const { uId, ...rest }: TAvatarProps = this.props;
    return <JuiAvatar {...rest}>SH</JuiAvatar>;
  }
}

export { Avatar, TAvatarProps };
export default Avatar;
