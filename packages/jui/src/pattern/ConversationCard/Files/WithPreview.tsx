/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-23 09:56:37
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ReactElement } from 'react';
import * as Jui from './style';
import { FileName } from './FileName';
import {
  withLoading,
  DefaultLoadingWithDelay,
  WithLoadingProps,
} from '../../../hoc/withLoading';

type JuiFileWithPreviewProps = {
  size: string;
  Actions: JSX.Element;
  fileName: string;
  url: string;
  iconType: string;
  isLoading?: boolean;
};

type LoadingProps = WithLoadingProps & {
  children: ReactElement;
};

const createTeamLoading = () => (
  <DefaultLoadingWithDelay backgroundType={'mask'} size={42} />
);
const Loading = withLoading(
  (props: LoadingProps) => <>{props.children}</>,
  createTeamLoading,
);

class JuiFileWithPreview extends React.PureComponent<JuiFileWithPreviewProps> {
  render() {
    const {
      size,
      fileName,
      url,
      Actions,
      iconType,
      isLoading = true,
    } = this.props;

    return (
      <Jui.FileCard>
        <Jui.LoadingContainer>
          <Loading loading={isLoading} alwaysComponentShow={true} delay={0}>
            <Jui.FileCardMedia image={url} />
          </Loading>
        </Jui.LoadingContainer>
        <Jui.FileCardContent>
          <Jui.CardFileName>
            <FileName filename={fileName} />
          </Jui.CardFileName>
          <Jui.CardFileInfo component="div">
            <Jui.CardSize data-test-automation-id="file-size">
              <Jui.FileIcon size="small">{iconType}</Jui.FileIcon>
              {size}
            </Jui.CardSize>
            <Jui.CardFileActions>{Actions}</Jui.CardFileActions>
          </Jui.CardFileInfo>
        </Jui.FileCardContent>
      </Jui.FileCard>
    );
  }
}

export { JuiFileWithPreview, JuiFileWithPreviewProps };
