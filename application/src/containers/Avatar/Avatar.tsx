import * as React from 'react';
import { JuiAvatar, TJuiAvatarProps } from 'ui-components/atoms/Avatar';
import { observer } from 'mobx-react';

type TAvatarProps = {
  id: number;
} & TJuiAvatarProps;

@observer
class Avatar extends React.Component<TAvatarProps, {}> {
  render() {
    const { id, ...rest } = this.props;
    return <JuiAvatar {...rest}>SH</JuiAvatar>;
  }
}

export { Avatar, TAvatarProps };
export default Avatar;
