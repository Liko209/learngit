import fs from 'fs';
import path from 'path';
import { name2icon } from 'jui/foundation/Iconography';

function getIconList(svgData: string): string[] {
  const re = /<title>(.+?)<\/title>/g;
  const matches: any = [];
  svgData.replace(re, function (m: any, p1: any) {
    matches.push(p1);
  } as any);
  return matches;
}

describe('icon svg file', () => {
  const file = fs.readFileSync(
    path.join(__dirname, '../../public/jupiter-icon.svg'),
    'utf8',
  );
  const icons = getIconList(file);
  it('contain all the icons that needed', () => {
    Object.values(name2icon).forEach((icon: string) => {
      expect(icons.includes(icon)).toBeTruthy();
    });
  });

  it('expect svg file to match snapshot', () => {
    expect(file).toMatchSnapshot();
  });
});
