/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-12 20:53:56
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiIconButton } from '../../../components/Buttons/IconButton/IconButton';
import { JuiFileWithExpand, JuiPreviewImage } from './';

type Props = {
  fileName: string;
  previewUrl: string;
  actions: JSX.Element;
};

type State = {
  expand: boolean;
};

class JuiExpandImage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      expand: false,
    };
  }

  switchExpand = () => {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  render() {
    const { actions, fileName, previewUrl } = this.props;

    return (
      <JuiFileWithExpand
        fileName={fileName}
        expand={this.state.expand}
        actions={
          <>
            {actions}
            <JuiIconButton
              onClick={this.switchExpand}
              variant="plain"
              tooltipTitle="expand"
            >
              event
            </JuiIconButton>
          </>
        }
      >
        <JuiPreviewImage
          url={previewUrl}
          fileName={fileName}
          ratio={0.5}
          actions={actions}
        />
      </JuiFileWithExpand>
    );
  }
}

export { JuiExpandImage };
