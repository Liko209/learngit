import { Selector } from 'testcafe';

// tslint:disable-next-line:function-name
function AnchorSelector(anchor: string) {
  return Selector(`*[data-anchor="${anchor}"]`);
}

export { AnchorSelector };
