import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { service } from 'sdk';
import { parse } from 'qs';

import ContentLoader from 'ui-components/organisms/ContentLoader';

interface IProps extends RouteComponentProps<{}> { }

interface IStates { }

type TParams = {
  state: string;
  code: string;
  id_token: string;
};

class GetToken extends Component<IProps, IStates>  {
  constructor(props: IProps) {
    super(props);
  }

  async componentDidMount() {
    // RC User
    // http://localhost:3000/?state=STATE&code=CODE
    // Free User (Glip create a new user)
    // http://localhost:3000/?state=STATE&id_token=TOKEN
    const { location, history } = this.props;
    const params: TParams = parse(location.search, { ignoreQueryPrefix: true });
    const { state, code, id_token } = params;
    const authService: service.AuthService = service.AuthService.getInstance();
    if (code || id_token) {
      await authService.unifiedLogin({ code, token: id_token });
    }
    history.replace(state.replace('$', '&') || '/');
  }

  render() {
    return < ContentLoader />;
  }
}

export default withRouter(GetToken);
