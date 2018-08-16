/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-15 08:54:29
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from 'styled-components';
// import { intlShape, injectIntl, FormattedMessage } from 'react-intl';

import { service } from 'sdk';
import config from '@/config';
// import { envConfig } from '@/globalConfig';
// import ErrorHandler from '@/containers/ErrorHandler/index.tsx';

// import Download from '@/components/Download';
// import LoginVersionStatus from '../Status/LoginVersionStatus';

const { glip2 } = config.get('api');
const { AuthService } = service;

const Form = styled.form`
  width: 300px;
  height: 450px;
  position: absolute;
  margin: auto;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const Button = styled.button`
  display: block;
  width: 100%;
  color: #fff;
  background-color: #007bff;
  border-color: 1px solid #007bff;
  font-size: 1.5rem;
  margin-top: 1em;
  padding: 0.625rem;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  &:hover {
    background-color: #0069d9;
    border-color: 1px solid #0062cc;
  }
  &:focus {
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);
  }
  &[disabled] {
    background-color: #007bff;
    border-color: #007bff;
    opacity: 0.65;
  }
`;

interface IRouter {
  location: { state: { from: Function } };
  history: { replace: Function };
}

function extractUrlParameter(name: string) {
  const nameTemp = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${nameTemp}=([^&#]*)`);
  const results = regex.exec(window.location.search);
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

class UnifiedLogin extends React.Component<
  IRouter,
  { btnDisabled: boolean; btnText: string }
  > {
  // static propTypes = {
  //   // intl: intlShape.isRequired,
  //   location: PropTypes.object,
  //   history: PropTypes.object
  // };

  static defaultProps = {
    location: {},
    history: {},
  };

  constructor(props: IRouter) {
    super(props);
    this.state = {
      btnDisabled: false,
      btnText: 'Login',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    const { location, history } = this.props;
    const code = extractUrlParameter('code');
    if (code) {
      this.setState({
        btnDisabled: true,
        btnText: `Login...`, // Login...
      });

      try {
        await AuthService.getInstance().unifiedLogin({ code });
        history.replace((location.state && location.state.from) || '/');
      } catch (error) {
        // const handler = new ErrorHandler(error);
        // handler.handle().show();
        console.log(error);
        this.setState({
          btnDisabled: false,
          btnText: `Login`, // Login
        });
      }
    }
  }

  handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    // const { intl } = this.props;
    this.setState({
      btnDisabled: true,
      btnText: `Login...`, // Login...
    });

    window.location.href = `${glip2.server}${
      glip2.apiPlatform
      }/oauth/authorize?force=true&response_type=code&client_id=${
      glip2.clientId
      }&state=%2Frc&redirect_uri=${
      window.location.origin
      }/unified-login/&brand_id=${
      glip2.brandId
      }&glip_auth=true&display=touch&title_bar=true`;
  }

  // eslint-disable-line react/prefer-stateless-function
  render() {
    const { btnDisabled, btnText } = this.state;
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <h1>
            <span>Sign In</span>
          </h1>
          <Button type="submit" disabled={btnDisabled}>
            {btnText}
          </Button>
        </Form>
        {/* <LoginVersionStatus /> */}
        {/* <Download /> */}
      </div>
    );
  }
}

export default UnifiedLogin;
