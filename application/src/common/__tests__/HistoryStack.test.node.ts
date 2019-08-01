import { HistoryStack } from '../HistoryStack';

jest.mock('@/utils/i18nT', () => ({
  i18nP: (key: string) => key,
}));

describe('history stack', () => {
  it('should can push pathname to stack', () => {
    const historyStack = new HistoryStack();
    const pathname = '/messages/text';
    historyStack.push(pathname);
    const cursor = historyStack.cursor;
    const stack = historyStack.stack;
    expect(cursor).toEqual(0);
    expect(stack.length).toEqual(1);
    expect(stack[0]).toEqual(pathname);
  });

  it('should can replace pathname to stack', () => {
    const historyStack = new HistoryStack();
    const pathname1 = '/messages/text1';
    const pathname2 = '/messages/text2';
    const pathname3 = '/messages/text3';
    historyStack.replace(pathname1);
    expect(historyStack.cursor).toEqual(0);
    expect(historyStack.stack.length).toEqual(1);
    expect(historyStack.stack[0]).toEqual(pathname1);

    historyStack.push(pathname2);
    historyStack.replace(pathname3);

    expect(historyStack.cursor).toEqual(1);
    expect(historyStack.stack.length).toEqual(2);
    expect(historyStack.stack[1]).toEqual(pathname3);
  });

  it('should can push pathname to stack when stack has pathname and cursor is in range stack length', () => {
    const historyStack = new HistoryStack();
    const pathname1 = '/messages/text1';
    const pathname2 = '/messages/text2';
    const pathname3 = '/messages/text3';
    const pathname4 = '/messages/text4';
    historyStack.push(pathname1);
    historyStack.push(pathname2);
    historyStack.push(pathname3);
    expect(historyStack.cursor).toEqual(2);
    expect(historyStack.stack.length).toEqual(3);

    historyStack.setCursor(1);
    expect(historyStack.cursor).toEqual(1);
    expect(historyStack.stack.length).toEqual(3);

    historyStack.push(pathname4);
    expect(historyStack.cursor).toEqual(2);
    expect(historyStack.stack.length).toEqual(3);
    expect(historyStack.stack[0]).toEqual(pathname1);
    expect(historyStack.stack[1]).toEqual(pathname2);
    expect(historyStack.stack[2]).toEqual(pathname4);
  });

  it('should return correct BackRecord and correct ForwardRecord', () => {
    const historyStack = new HistoryStack();
    const pathname1 = '/messages/text1';
    const pathname2 = '/messages/text2';
    const pathname3 = '/messages/text3';
    const pathname4 = '/messages/text4';
    historyStack.push(pathname1);
    historyStack.push(pathname2);
    historyStack.push(pathname3);
    historyStack.push(pathname4);

    let backRecord = historyStack.backRecord;
    expect(backRecord.length).toEqual(3);
    expect(backRecord[0]).toEqual(pathname1);
    expect(backRecord[1]).toEqual(pathname2);
    expect(backRecord[2]).toEqual(pathname3);
    let forwardRecord = historyStack.forwardRecord;
    expect(forwardRecord.length).toEqual(0);

    historyStack.setCursor(2);
    backRecord = historyStack.backRecord;
    expect(backRecord.length).toEqual(2);
    expect(backRecord[0]).toEqual(pathname1);
    expect(backRecord[1]).toEqual(pathname2);
    forwardRecord = historyStack.forwardRecord;
    expect(forwardRecord.length).toEqual(1);
    expect(forwardRecord[0]).toEqual(pathname4);

    historyStack.setCursor(1);
    backRecord = historyStack.backRecord;
    expect(backRecord.length).toEqual(1);
    expect(backRecord[0]).toEqual(pathname1);
    forwardRecord = historyStack.forwardRecord;
    expect(forwardRecord.length).toEqual(2);
    expect(forwardRecord[0]).toEqual(pathname3);
    expect(forwardRecord[1]).toEqual(pathname4);

    historyStack.setCursor(0);
    backRecord = historyStack.backRecord;
    expect(backRecord.length).toEqual(0);
    forwardRecord = historyStack.forwardRecord;
    expect(forwardRecord.length).toEqual(3);
    expect(forwardRecord[0]).toEqual(pathname2);
    expect(forwardRecord[1]).toEqual(pathname3);
    expect(forwardRecord[2]).toEqual(pathname4);
  });

  it('should return current cursor value', () => {
    const historyStack = new HistoryStack();
    const pathname1 = '/messages/text1';
    const pathname2 = '/messages/text2';
    const pathname3 = '/messages/text3';

    historyStack.push(pathname1);
    historyStack.push(pathname2);
    historyStack.push(pathname3);

    expect(historyStack.getCurrentPathname()).toEqual(pathname3);

    historyStack.setCursor(0);
    expect(historyStack.getCurrentPathname()).toEqual(pathname1);
  });
});
