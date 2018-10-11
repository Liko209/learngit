import { Selector } from 'testcafe';

// tslint:disable-next-line:function-name
function AnchorSelector(anchor: string) {
  return Selector(`*[data-anchor="${anchor}"]`);
}
// tslint:disable-next-line:function-name
function AutomationSelector(id: string) {
  return Selector(`*[data-test-automation-id="${id}"]`);
}
export { AnchorSelector, AutomationSelector };
