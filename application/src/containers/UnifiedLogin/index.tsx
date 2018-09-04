/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-15 08:54:29
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import i18next, { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import { stringify } from 'qs';
import styled from 'styled-components';

import config from '@/config';
import EnvSelect from './EnvSelect';
import Download from './Download';

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

const getLanguage = () => {
  const lng = i18next.language || window.localStorage.getItem('i18nextLng') || 'en-US';
  const arr = lng.split('-');
  const map = {
    de: ['DE'],
    en: ['US', 'GB'],
    es: ['ES', '419'],
    fr: ['FR', 'CA'],
    it: ['IT'],
    pt: ['BR'],
    ja: ['JP'],
  };
  const locals = map[arr[0]];
  if (!locals) {
    return 'en-US';
  }
  const local = locals.find((l: string) => l === arr[1]);
  if (!local) {
    return arr[0] + '-' + locals[0];
  }
  return lng;
};

interface IProps extends RouteComponentProps<{}> {
  t: TranslationFunction;
}

interface IStates {
  disabled: boolean;
  brandId: string;
}

class UnifiedLogin extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      disabled: false,
      brandId: '1210',
    };
  }

  onChange = (event: React.FormEvent<HTMLSelectElement>) => {
    this.setState({ brandId: event.currentTarget.value });
  }

  onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const { brandId } = this.state;
    const { location } = this.props;
    const { glip2 } = config.get('api');
    const url = `${glip2.server}${glip2.apiPlatform}/oauth/authorize`;
    const { from } = location.state || { from: {} };
    const { pathname, search, hash } = from;
    const state = pathname + search.replace('&', '$') + hash;
    const redirect_uri = window.location.origin; // The URI must match exactly with the sandbox configuration
    const params = {
      redirect_uri,
      state,
      response_type: 'code',
      client_id: glip2.clientId,
      brand_id: brandId,
      ui_locales: getLanguage(), // default en_US
      force: true,
      endpointId: '',
      display: 'touch',
      prompt: 'login sso',
      scope: '',
      ui_options: 'external_popup remember_me_on show_back_to_app',
      hideNavigationBar: true,
      glip_auth: true,
      response_hint: 'remember_me+login_type',
      title_bar: true,
    };
    window.location.href = url + '?' + stringify(params);

    // Auth wiki
    // https://wiki.ringcentral.com/pages/viewpage.action?pageId=207394909

    // Glip sign In
    // https://service.ringcentral.com/login/unifiedLoginM.html?
    // session=-8895747689600087505
    // &responseType=code
    // &clientId=cZPfEqZkQxKa9dUEu9RkCA
    // &brandId=1210
    // &state=/rc
    // &localeId=en_US
    // &endpointId=
    // &display=touch
    // &prompt=login sso
    // &scope=
    // &appUrlScheme=https://app.glip.com/api/no-auth/rc-signon
    // &ui_options=external_popup remember_me_on show_back_to_app
    // &hideNavigationBar=true
    // &glip_auth=true
    // &response_hint=remember_me+login_type
    // &title_bar=true

    // window.location.href = `${glip2.server}${
    //   glip2.apiPlatform
    //   }/oauth/authorize?force=true&response_type=code&client_id=${
    //   glip2.clientId
    //   }&state=%2Frc&redirect_uri=${
    //   window.location.origin
    //   }/unified-login/&brand_id=${
    //   glip2.brandId
    //   }&glip_auth=true&display=touch&title_bar=true`;
  }

  render() {
    const { disabled, brandId } = this.state;
    const { t } = this.props;
    return (
      <div>
        <Form onSubmit={this.onSubmit}>
          <Button type="submit" disabled={disabled} data-anchor="btnLogin" >
            {t('SignIn')}
          </Button>
          <select onChange={this.onChange} value={brandId} style={{ display: 'none' }}>
            <option value="1210">RC US</option>
            <option value="3610">CA</option>
            <option value="2010">EU</option>
            <option value="3710">UK</option>
            <option value="5010">AU</option>
            <option value="3420">AT&T</option>
            <option value="7310">TELUS</option>
          </select>
          <EnvSelect />
        </Form>
        <Download />
      </div >
    );
  }
}

export default translate('translations')(UnifiedLogin);

// const map = {
//   'de-DE': 'de-DE', // Deutsch
//   'en-GB': 'en-GB', // English (U.K.)
//   'en-US': 'en-US', // English (U.S.)
//   'es-ES': 'es-ES', // Español
//   'es-419': 'es-419', // Español (Latinoamérica)
//   'fr-FR': 'fr-FR', // Français
//   'fr-CA': 'fr-CA', // Français (Canada)
//   'it-IT': 'it-IT', // Italiano
//   'pt-BR': 'pt-BR', // Português (Brasil)
//   'ja-JP': 'ja-JP', // 日本語
// };
