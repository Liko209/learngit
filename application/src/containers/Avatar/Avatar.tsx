import * as React from 'react';
import { JuiAvatar, TJuiAvatarProps } from 'ui-components/atoms/Avatar';
import { observer } from 'mobx-react';
import ViewModel from './ViewModel';
import styled from 'styled-components';

type TAvatarProps = TJuiAvatarProps & {
  uId: number;
};
const StyleAvatar = styled(JuiAvatar)`
  background-color: #7f7f7f;
`;
type TAvatarState = {
  avatar: string,
  name: string,
  bgColor: string,
};
@observer
class Avatar extends React.Component<TAvatarProps, TAvatarState> {
  private _vm: ViewModel;
  constructor(props: TAvatarProps) {
    super(props);
    this._vm = new ViewModel();
    this.state = {
      avatar: '',
      name: '',
      bgColor: '',
    };
  }
  componentWillMount() {
    const { uId } = this.props;
    this._vm.getPersonInfo(uId);
    const userInfo = this._vm.handleUserName();
    console.log(userInfo);
  }
  render() {
    const { avatar } = this.state;
    // const { uId, ...rest }: TAvatarProps = this.props;
    return avatar ? <JuiAvatar /> : <StyleAvatar>ss</StyleAvatar>;
  }
}

export { Avatar, TAvatarProps };
export default Avatar;
