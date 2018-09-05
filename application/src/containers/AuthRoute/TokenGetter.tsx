import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { service } from 'sdk';
import { parse } from 'qs';

import ContentLoader from 'ui-components/organisms/ContentLoader';

interface IProps extends RouteComponentProps<{}> { }

interface IStates { }

class TokenGetter extends Component<IProps, IStates>  {
  constructor(props: IProps) {
    super(props);
  }

  async componentDidMount() {
    // RC User
    // http://localhost:3000/?state=STATE&code=CODE
    // Free User (Glip create a new user)
    // http://localhost:3000/?state=STATE&id_token=TOKEN
    const { location, history } = this.props;
    const params = parse(location.search, { ignoreQueryPrefix: true });
    const { state = '/', code, id_token: token } = params;
    const authService: service.AuthService = service.AuthService.getInstance();
    if (code || token) {
      await authService.unifiedLogin({ code, token });
    }
    history.replace(state.replace('$', '&'));
  }

  render() {
    return < ContentLoader />;
  }
}

export default withRouter(TokenGetter);
