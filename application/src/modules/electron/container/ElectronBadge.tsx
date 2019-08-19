import { Component } from 'react';
import { container } from 'framework/ioc';
import { ElectronService } from '../service';

type ElectronBadgeProps = {
  children: number;
};

/**
 * Update document.title umi
 */
class ElectronBadge extends Component<ElectronBadgeProps> {
  private _electronService = container.get(ElectronService);

  render() {
    const count = this.props.children;
    this._electronService.setBadgeCount(count);
    return null;
  }
}

export { ElectronBadge, ElectronBadgeProps };
