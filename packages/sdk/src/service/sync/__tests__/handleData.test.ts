import handleData from '../handleData';

jest.mock('../../account/handleData', () => jest.fn().mockResolvedValue(true));
it('handleData()', async () => {
  await handleData({
    data: {},
    status: 200,
    headers: {},
  });
});

it('handleData()', async () => {
  await handleData({
    data: {
      timestamp: 123,
      scoreboard: 'HOST',
      state: {
        a: 1,
      },
      profile: {
        b: 2,
      },
    },
    status: 200,
    headers: {},
  });
});
