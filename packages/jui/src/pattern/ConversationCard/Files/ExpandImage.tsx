/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-12 20:53:56
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiIconButton } from '../../../components/Buttons/IconButton/IconButton';
import { JuiFileWithExpand, JuiPreviewImage } from './';

type Props = {
  icon: string;
  fileName: string;
  previewUrl: string;
  Actions: JSX.Element;
  i18UnfoldMore: string;
  i18UnfoldLess: string;
  ImageActions?: JSX.Element;
};

type State = {
  expand: boolean;
};

class JuiExpandImage extends React.PureComponent<Props, State> {
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
    const {
      Actions,
      fileName,
      previewUrl,
      ImageActions,
      i18UnfoldMore,
      i18UnfoldLess,
      icon,
    } = this.props;

    return (
      <JuiFileWithExpand
        icon={icon}
        fileName={fileName}
        expand={this.state.expand}
        Actions={
          <>
            {Actions}
            <JuiIconButton
              onClick={this.switchExpand}
              variant="plain"
              tooltipTitle={i18UnfoldMore}
            >
              unfold_more
            </JuiIconButton>
          </>
        }
      >
        <JuiPreviewImage
          url={previewUrl}
          fileName={fileName}
          width={360}
          height={202}
          Actions={
            <>
              {ImageActions}
              <JuiIconButton
                onClick={this.switchExpand}
                variant="plain"
                tooltipTitle={i18UnfoldLess}
              >
                unfold_less
              </JuiIconButton>
            </>
          }
        />
      </JuiFileWithExpand>
    );
  }
}

export { JuiExpandImage };
