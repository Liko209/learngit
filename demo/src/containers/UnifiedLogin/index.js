/**
 *
 * UnifiedLogin
 *
 */

import React from 'react';
// import { intlShape, injectIntl, FormattedMessage } from 'react-intl';

import { service } from 'sdk';

import PropTypes from 'prop-types';
import { envConfig } from '@/globalConfig';
import ErrorHandler from '@/containers/ErrorHandler';

import Download from '@/components/Download';
import Form from '../Login/Form';
// import messages from '../Login/messages';
import Button from '../Login/Button';
import LoginVersionStatus from '../Status/LoginVersionStatus';

const { AuthService } = service;
const { glip2 } = envConfig.api;

function extractUrlParameter(name) {
  const nameTemp = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${nameTemp}=([^&#]*)`);
  const results = regex.exec(window.location.search);
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

class UnifiedLogin extends React.Component {
  static propTypes = {
    // intl: intlShape.isRequired,
    location: PropTypes.object,
    history: PropTypes.object
  };

  static defaultProps = {
    location: {},
    history: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      btnDisabled: false,
      btnText: 'Login'
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    const { location, history } = this.props;
    const code = extractUrlParameter('code');
    if (code) {
      this.setState({
        btnDisabled: true,
        btnText: `Login...` // Login...
      });

      try {
        await AuthService.getInstance().unifiedLogin({ code });
        history.replace((location.state && location.state.from) || '/');
      } catch (error) {
        const handler = new ErrorHandler(error);
        handler.handle().show();
      } finally {
        this.setState({
          btnDisabled: false,
          btnText: `Login` // Login
        });
      }

      // login({ code: this.getUrlParameter('code') })
      //   .then(() => {
      //     history.replace(
      //       (location.state && location.state.redirect) || '/conversation/'
      //     );
      //   })
      //   .catch((error) => {
      //     this.setState({
      //       btnDisabled: false,
      //       btnText: intl.formatMessage(messages.login), // Login
      //     });
      //     /* eslint no-console: "off" */
      //     console.error(error);
      //   });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    // const { intl } = this.props;
    this.setState({
      btnDisabled: true,
      btnText: `Login...` // Login...
    });

    window.location = `${glip2.server}${
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
        <LoginVersionStatus />
        <Download />
      </div>
    );
  }
}

// UnifiedLogin.propTypes = {
//   intl: intlShape.isRequired,
// };

// const mapStateToProps = createStructuredSelector({
//   unifiedlogin: makeSelectUnifiedLogin(),
// });

// function mapDispatchToProps(dispatch) {
//   return {
//     dispatch,
//   };
// }

// const withConnect = connect(mapStateToProps, mapDispatchToProps);

// const withReducer = injectReducer({ key: 'unifiedLogin', reducer });
// const withSaga = injectSaga({ key: 'unifiedLogin', saga });

export default UnifiedLogin;
