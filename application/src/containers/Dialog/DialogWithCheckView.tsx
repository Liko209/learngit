/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-09-13 09:54:47
 * Copyright © RingCentral. All rights reserved.
 */

import React, { MouseEvent } from 'react';
import ReactDOM from 'react-dom';
// import Dialog from 'ui-components/atoms/Dialog';
import Alert from 'ui-components/molecules/Dialog/Alert';
import ThemeProvider from '@/containers/ThemeProvider';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import CheckboxLabel from 'ui-components/atoms/Checkbox';

interface IProps {
  okText?: string;
  header: string;
  content: string;
  onClose?(isChecked: boolean, event: MouseEvent<HTMLElement>): void;
  checkBoxContent?: string;
}

interface IDialogWithCheckViewProps extends IProps {
  callback?: Function;
}

@observer
class DialogWithCheckView extends React.Component<IDialogWithCheckViewProps> {
  @observable
  private _open: boolean;
  private _checked: boolean;
  constructor(props: IDialogWithCheckViewProps) {
    super(props);
    this._open = true;
    this.handleClose = this.handleClose.bind(this);
    this.checkboxChange = this.checkboxChange.bind(this);
    this._checked = false;
  }

  @action
  handleClose(event: MouseEvent<HTMLElement>) {
    this._open = false;
    if (this.props.callback) {
      this.props.callback();
    }
    if (this.props.onClose) {
      this.props.onClose(this._checked, event);
    }
  }

  checkboxChange(event: React.ChangeEvent<{}>, checked: boolean) {
    this._checked = checked;
  }

  render() {
    return (
      <ThemeProvider>
        <Alert
          open={this._open}
          okText={this.props.okText}
          size="large"
          onClose={this.handleClose}
          header={this.props.header}
          others={
            <CheckboxLabel
              label={this.props.checkBoxContent || ''}
              checked={false}
              handleChange={this.checkboxChange}
            />
          }
        >
          {this.props.content}
        </Alert>
      </ThemeProvider>
    );
  }
}

export default function showDialogWithCheckView(props: IProps) {
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

  function render(props: IDialogWithCheckViewProps) {
    ReactDOM.render(<DialogWithCheckView {...props} />, div);
  }
  render(alertProps);
}
