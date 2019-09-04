/*
 * @Author: isaac.liu
 * @Date: 2019-05-28 16:53:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Route, withRouter } from 'react-router-dom';

import { ContactTabRouter } from './ContactTabRouter';
import { ContactTabProps } from './types';

@observer
class ContactTabComponent extends Component<ContactTabProps> {
  render() {
    return (
      <Route
        path={`${this.props.match.path}/:subPath?`}
        component={ContactTabRouter}
      />
    );
  }
}

const ContactTab = withRouter(ContactTabComponent);

export { ContactTab };
