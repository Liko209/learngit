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
  Actions: JSX.Element;
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
    const { Actions, fileName, previewUrl } = this.props;

    return (
      <JuiFileWithExpand
        fileName={fileName}
        expand={this.state.expand}
        Actions={
          <>
            {Actions}
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
          Actions={Actions}
        />
      </JuiFileWithExpand>
    );
  }
}

export { JuiExpandImage };
