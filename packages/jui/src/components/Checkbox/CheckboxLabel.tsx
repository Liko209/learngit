/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2018-09-13 15:06:38
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import { withStyles } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';

const styles = {
  root: {
    color: green[600],
    '&$checked': {
      color: green[500],
    },
  },
  checked: {},
  size: {
    width: 40,
    height: 40,
  },
  sizeIcon: {
    fontSize: 20,
  },
};

type CheckboxLabelProps = {
  checked: boolean;
  label: string;
  handleChange(event: React.ChangeEvent<{}>, checked: boolean): void;
};
const CheckboxLabel = memo((props: CheckboxLabelProps) => {
  return <CheckboxWithLabel {...props} />;
});

@observer
class CheckboxWithLabel extends React.Component<CheckboxLabelProps> {
  @observable
  private _checked: boolean;
  private _handleChange: Function;
  private _label: string;
  constructor(props: CheckboxLabelProps) {
    super(props);
    this._checked = props.checked;
    this._handleChange = props.handleChange;
    this._label = props.label;
    this.onChange = this.onChange.bind(this);
  }

  @action
  onChange(event: React.ChangeEvent<{}>, checked: boolean) {
    this._checked = checked;
    if (this._handleChange) {
      this._handleChange(event, checked);
    }
  }

  render() {
    return (
      <FormControlLabel
        control={<Checkbox checked={this._checked} onChange={this.onChange} />}
        label={this._label}
      />
    );
  }
}

const JuiCheckboxLabel = withStyles(styles)(CheckboxLabel);

export { JuiCheckboxLabel };
