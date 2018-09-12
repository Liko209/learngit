/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-09-12 13:35:58
 * Copyright © RingCentral. All rights reserved.
 */

import Alert from 'ui-components/molecules/Dialog/Alert';
import ThemeProvider from '@/containers/ThemeProvider';
import React, { MouseEvent } from 'react';
import ReactDOM from 'react-dom';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
const GLOBAL_ALERT_NODE = document.getElementById('globalAlert') as HTMLElement;

interface IProps {
  okText?: string;
  header: string;
  content: string;
  onClose?(event: MouseEvent<HTMLElement>): void;
}

interface IAlertProps extends IProps {
  callback?: Function;
}

@observer
class GlobalAlert extends React.Component<IAlertProps> {
  @observable
  private _open: boolean;
  constructor(props: IAlertProps) {
    super(props);
    this._open = true;
    this.handleClose = this.handleClose.bind(this);
  }

  @action
  handleClose(event: MouseEvent<HTMLElement>) {
    this._open = false;
    if (this.props.onClose) {
      this.props.onClose(event);
    }
    if (this.props.callback) {
      this.props.callback();
    }
    ReactDOM.unmountComponentAtNode(GLOBAL_ALERT_NODE);
  }

  render() {
    const { header, okText, content } = this.props;

    return (
      <ThemeProvider>
        <Alert
          open={this._open}
          header={header}
          onClose={this.handleClose}
          okText={okText}
        >
          {content}
        </Alert>
      </ThemeProvider>
    );
  }
}

function showGlobalAlert(props: IProps) {
  const div = document.createElement('div');
  document.body.appendChild(div);

  const alertProps = props;
  const dismiss = () => {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  };
  alertProps['callback'] = dismiss;

  function render(props: IAlertProps) {
    ReactDOM.render(<GlobalAlert {...props} />, div);
  }
  render(alertProps);
}

export default showGlobalAlert;
