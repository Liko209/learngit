import * as React from 'react';
import { translate } from 'react-i18next';
import { i18n } from 'i18next';

interface IProps {
  i18n: i18n;
}

interface ILanguage {
  code: string;
  label: string;
}

class LanguageSwitcher extends React.PureComponent<IProps> {
  constructor(props: IProps) {
    super(props);
    const { i18n } = this.props;
    this.state = { language: i18n.language };

    this.handleChangeLanguage = this.handleChangeLanguage.bind(this);
  }

  static getDerivedStateFromProps(props: IProps) {
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

export default translate('LanguageSwitcher')(LanguageSwitcher);
