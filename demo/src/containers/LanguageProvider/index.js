/*
 *
 * LanguageProvider
 *
 * this component connects the redux state language locale to the
 * IntlProvider component and i18n messages (loaded from `app/translations`)
 */

import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';

export class LanguageProvider extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <IntlProvider
          locale={this.props.locale}
          key={this.props.locale}
          messages={this.props.messages[this.props.locale]}
      >
        {React.Children.only(this.props.children)}
      </IntlProvider>
    );
  }
}

LanguageProvider.propTypes = {
  locale: PropTypes.string.isRequired,
  messages: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired
};

export default LanguageProvider;
