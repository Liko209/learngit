import { HistoryStack } from '../HistoryStack';

describe('history stack', () => {
  it('should can push pathname to stack', () => {
    const historyStack = new HistoryStack();
    const pathname = 'text';
    historyStack.push(pathname);
    const pointer = historyStack.getPointer();
    const stack = historyStack.getStack();
    expect(pointer).toEqual(0);
    expect(stack.length).toEqual(1);
    expect(stack[0]).toEqual(pathname);
  });

  it('should can push pathname to stack when stack has pathname and pointer is in range stack length', () => {
    const historyStack = new HistoryStack();
    const pathname1 = 'text1';
    const pathname2 = 'text2';
    const pathname3 = 'text3';
    const pathname4 = 'text4';
    historyStack.push(pathname1);
    historyStack.push(pathname2);
    historyStack.push(pathname3);
    let pointer = historyStack.getPointer();
    const stack = historyStack.getStack();
    expect(pointer).toEqual(2);
    expect(stack.length).toEqual(3);

    historyStack.setPointer(1);
    pointer = historyStack.getPointer();
    expect(pointer).toEqual(1);
    expect(stack.length).toEqual(3);

    historyStack.push(pathname4);
    pointer = historyStack.getPointer();
    expect(pointer).toEqual(2);
    expect(stack.length).toEqual(3);
    expect(stack[0]).toEqual(pathname1);
    expect(stack[1]).toEqual(pathname2);
    expect(stack[2]).toEqual(pathname4);
  });

  it('should return correct BackRecord and correct ForwardRecord', () => {
    const historyStack = new HistoryStack();
    const pathname1 = 'text1';
    const pathname2 = 'text2';
    const pathname3 = 'text3';
    const pathname4 = 'text4';
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

    historyStack.setPointer(2);
    backRecord = historyStack.backRecord;
    expect(backRecord.length).toEqual(2);
    expect(backRecord[0]).toEqual(pathname1);
    expect(backRecord[1]).toEqual(pathname2);
    forwardRecord = historyStack.forwardRecord;
    expect(forwardRecord.length).toEqual(1);
    expect(forwardRecord[0]).toEqual(pathname4);

    historyStack.setPointer(1);
    backRecord = historyStack.backRecord;
    expect(backRecord.length).toEqual(1);
    expect(backRecord[0]).toEqual(pathname1);
    forwardRecord = historyStack.forwardRecord;
    expect(forwardRecord.length).toEqual(2);
    expect(forwardRecord[0]).toEqual(pathname3);
    expect(forwardRecord[1]).toEqual(pathname4);

    historyStack.setPointer(0);
    backRecord = historyStack.backRecord;
    expect(backRecord.length).toEqual(0);
    forwardRecord = historyStack.forwardRecord;
    expect(forwardRecord.length).toEqual(3);
    expect(forwardRecord[0]).toEqual(pathname2);
    expect(forwardRecord[1]).toEqual(pathname3);
    expect(forwardRecord[2]).toEqual(pathname4);
  });
});
