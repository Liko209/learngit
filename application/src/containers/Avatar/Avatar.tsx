import * as React from 'react';
import { JuiAvatar, TJuiAvatarProps } from 'ui-components/atoms/Avatar';
import { observer } from 'mobx-react';

type TAvatarProps = TJuiAvatarProps & {
  uId: number;
};

@observer
class Avatar extends React.Component<TAvatarProps, {}> {
  render() {
    const { uId, ...rest }: TAvatarProps = this.props;
    return <JuiAvatar {...rest}>SH</JuiAvatar>;
  }
}

export { Avatar, TAvatarProps };
export default Avatar;
