import { Component } from 'react';

type DocumentTitleProps = {
  children: string;
};

/**
 * Update document.title
 */
class DocumentTitle extends Component<DocumentTitleProps> {
  render() {
    document.title = this.props.children;
    return null;
  }
}

export { DocumentTitle };
