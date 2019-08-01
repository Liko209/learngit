import { PureComponent } from 'react';

type DocumentTitleProps = {
  children: string;
};

/**
 * Update document.title
 */
class DocumentTitle extends PureComponent<DocumentTitleProps> {
  render() {
    document.title = this.props.children;
    return null;
  }
}

export { DocumentTitle };
