/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-12 20:53:56
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { JuiIconButton } from '../../../components/Buttons/IconButton/IconButton';
import { JuiFileWithExpand } from './FileWithExpand';
import { JuiPreviewImage } from './PreviewImage';
import moize from 'moize';

type Props = {
  icon: string;
  fileName: React.ReactChild | (React.ReactChild | null)[] | null;
  previewUrl: string;
  Actions: JSX.Element;
  i18UnfoldMore: string;
  i18UnfoldLess: string;
  ImageActions?: JSX.Element;
  handleImageClick?: (ev: React.MouseEvent, loaded: boolean) => void;
  onSwitchExpand: (isExpanded: boolean) => void;
  defaultExpansionStatus?: boolean;
};

type State = {
  expand?: boolean;
};

class JuiExpandImage extends React.PureComponent<Props, State> {
  static defaultProps = {
    onSwitchExpand: () => {},
  };
  constructor(props: Props) {
    super(props);
    this.state = {
      expand: this.props.defaultExpansionStatus,
    };
  }

  switchExpand = () => {
    const { expand } = this.state;
    const { onSwitchExpand } = this.props;
    this.setState({
      expand: !expand,
    });
    onSwitchExpand(!expand);
  }

  _Actions = moize((tooltip: string, ImageActions?: JSX.Element) => {
    if (ImageActions) {
      return [
        ImageActions,
        <JuiIconButton
          onClick={this.switchExpand}
          variant="plain"
          tooltipTitle={tooltip}
          key="unfoldAction"
        >
          unfold_less
        </JuiIconButton>,
      ];
    }
    return [
      <JuiIconButton
        onClick={this.switchExpand}
        variant="plain"
        tooltipTitle={tooltip}
        key="unfoldAction"
      >
        unfold_less
      </JuiIconButton>,
    ];
  });

  render() {
    const {
      Actions,
      fileName,
      previewUrl,
      ImageActions,
      i18UnfoldMore,
      i18UnfoldLess,
      icon,
      handleImageClick,
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
          handleImageClick={handleImageClick}
          width={360}
          height={202}
          Actions={this._Actions(i18UnfoldLess, ImageActions)}
        />
      </JuiFileWithExpand>
    );
  }
}

export { JuiExpandImage };
