import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

interface ILanguage {
  code: string;
  label: string;
}

class LanguageSwitcher extends React.PureComponent<WithTranslation> {
  constructor(props: WithTranslation) {
    super(props);
    const { i18n } = this.props;
    this.state = { language: i18n.language };

    this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
  }

  static getDerivedStateFromProps(props: WithTranslation) {
    return { language: props.i18n.language };
  }

  handleChangeLanguage(lng: string) {
    const { i18n } = this.props;
    i18n.changeLanguage(lng);
  }

  renderLanguageChoice({ code, label }: ILanguage) {
    const handleChangeLanguage = () => this.handleChangeLanguage(code);
    return (
      <button key={code} onClick={handleChangeLanguage}>
        {label}
      </button>
    );
  }

  render() {
    const languages: ILanguage[] = [
      { code: 'en', label: 'English' },
      { code: 'zh', label: '简体中文' },
    ];

    return (
      <div className="LanguageSwitcher">
        {languages.map(language => this.renderLanguageChoice(language))}
      </div>
    );
  }
}

export default withTranslation('LanguageSwitcher')(LanguageSwitcher);
