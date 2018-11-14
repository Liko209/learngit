import notificationCenter from '../notificationCenter';

it('emitEntityUpdate()', () => {
  const result = notificationCenter.emitEntityUpdate('KEY', []);
  expect(result).toBeUndefined();
});

it('emitEntityDelete()', () => {
  const result = notificationCenter.emitEntityDelete('KEY', []);
  expect(result).toBeUndefined();
});

it('emitEntityReset()', () => {
  const result = notificationCenter.emitEntityReset('KEY');
  expect(result).toBeUndefined();
});

it('emitEntityReload()', () => {
  const result = notificationCenter.emitEntityReload('KEY');
  expect(result).toBeUndefined();
});

it('emitEntityReplace()', () => {
  const entitiesMap = new Map<number, any>();
  const result = notificationCenter.emitEntityReplace('KEY', entitiesMap);
  expect(result).toBeUndefined();
});

it('emitKVChange()', () => {
  const result = notificationCenter.emitKVChange('KEY', []);
  expect(result).toBeUndefined();
});
