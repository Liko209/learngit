/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-10 09:36:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { parse } from 'qs';

import ViewModel from './ViewModel';
import ContentLoader from 'ui-components/organisms/ContentLoader';

interface IProps extends RouteComponentProps<{}> { }

interface IStates { }

class TokenGetter extends Component<IProps, IStates>  {
  private _vm: ViewModel;

  constructor(props: IProps) {
    super(props);
    this._vm = new ViewModel();
  }

  async componentDidMount() {
    // RC User
    // http://localhost:3000/?state=STATE&code=CODE
    // Free User (Glip create a new user)
    // http://localhost:3000/?state=STATE&id_token=TOKEN
    const { location, history } = this.props;
    const params = parse(location.search, { ignoreQueryPrefix: true });
    const { state = '/', code, id_token: token } = params;
    if (code || token) {
      await this._vm.unifiedLogin({ code, token });
    }
    history.replace(state.replace('$', '&'));
  }

  render() {
    return < ContentLoader />;
  }
}

export default withRouter(TokenGetter);
