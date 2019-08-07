/*
 * @Author: doyle.wu
 * @Date: 2019-07-05 09:43:50
 */
import { Config } from '../../config';
import { getDashboardConfig } from './init';
const _config = getDashboardConfig();

class DashboardPair {
  current: number;
  last: number;
  unit: string;

  constructor(current: number, last: number, unit: string) {
    this.current = current;
    this.last = last;
    this.unit = unit;
  }

  private isOverBaseline(value: number, baseline?: number, bottom: number = 100, acceptable: number = 10, rate: number = 1.1): boolean {
    if (!baseline) {
      return false;
    }

    if (value < bottom) {
      return value > (baseline + acceptable);
    } else {
      return value > (baseline * rate);
    }
  }

  _calculate(goal?: number, bottom: number = 100, acceptable: number = 10, warnRate: number = 1.1, blockRate: number = 1.1): {
    icon: string, level: string, color: string, text: string
  } {
    let icon = _config.icons.pass;
    let color = _config.colors.pass;

    let level = 'pass';

    let text = [];
    if (this.current) {
      text.push(this.current.toFixed(2), this.unit);
    }

    if (this.last) {
      const offset = this.current - this.last;
      if (offset > 0) {
        text.push('(+', offset.toFixed(2), ')');
      } else if (offset < 0) {
        text.push('(', offset.toFixed(2), ')');
      }
    }

    if (this.isOverBaseline(this.current, this.last, bottom, acceptable, warnRate)) {
      level = 'warn';
      icon = _config.icons.warning;
      color = _config.colors.warning;
    }

    if (this.isOverBaseline(this.current, goal, bottom, acceptable, blockRate)) {
      level = 'block';
      icon = _config.icons.block;
      color = _config.colors.block;
    }
    return { icon, level, color, text: text.join('') };
  }

  formatHtml(goal?: number): string {
    let { color, text } = this._calculate(goal);
    return `<span style="color:${color};margin-left:10px;margin-right:40px;">${text}</span>`
  }

  formatGlip(key: string, handleCount: number, link: string, goal?: number): { level: string, text: string } {
    let { icon, level } = this._calculate(goal);

    let text = [icon, 'do [**', key, '**](', link, ') ', Config.sceneRepeatCount, ' times, average consuming time: **',
      this.current.toFixed(2), '** ', this.unit];
    if (handleCount >= 0) {
      text.push(', number of data: **', handleCount, '**');
    }

    return {
      level,
      text: text.join('')
    };
  }

  formatMemoryForHtml() {
    let { color, text } = this._calculate(this.last, 500, 50, 1.1, 1.2);

    return `<span style="color:${color};margin-left:10px;margin-right:40px;">${text}</span>`
  }

  formatMemoryForGlip() {
    let { icon, level } = this._calculate(this.last, 500, 50, 1.1, 1.2);
    return { icon, level }
  }

  formatLinearRegressionForHtml(b: DashboardPair) {
    let resultOfK = this._calculate(this.last, 2, 0.2, 1.1, 1.2);
    let resultOfB = b._calculate(b.last, 500, 50, 1.1, 1.2);

    let color = _config.colors.pass;

    if (resultOfK.level === 'warn' || resultOfB.level === 'warn') {
      color = _config.colors.warning;
    }

    if (resultOfK.level === 'block' || resultOfB.level === 'block') {
      color = _config.colors.block;
    }

    let text = ['<span style="color:', color, ';margin-left:10px;margin-right:40px;font-size:18px">y = ',
      this.current, 'x + ', b.current];
    if (this.last && b.last) {
      text.push('<span style="font-size: 14px;margin-left:10px;text-decoration: line-through;color:', color, '">y = ',
        this.last, 'x + ', b.last, '</span>');
    }

    text.push('</span>');

    return text.join('');
  }

  formatLinearRegressionForGlip(b: DashboardPair) {
    let resultOfK = this._calculate(this.last, 2, 0.2, 1.1, 1.2);
    let resultOfB;
    if (b) {
      resultOfB = b._calculate(this.last, 500, 50, 1.1, 1.2);
    }
    let level = 'pass';

    if (resultOfK.level === 'warn' || (resultOfB && resultOfB.level === 'warn')) {
      level = 'warn';
    }

    if (resultOfK.level === 'block' || (resultOfB && resultOfB.level === 'block')) {
      level = 'block';
    }

    return level;
  }
}

export {
  DashboardPair
}
