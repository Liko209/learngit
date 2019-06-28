import { TypingIndicator } from '../TypingIndicator';
describe('TypingIndicator', () => {
  describe('getTranslations()', () => {
    it.each`
      typingList                | key             | values
      ${['alex']}               | ${'oneTyping'}  | ${{ personA: 'alex' }}
      ${['alex', 'ben']}        | ${'twoTyping'}  | ${{ personA: 'alex', personB: 'ben' }}
      ${['alex', 'ben', 'cat']} | ${'moreTyping'} | ${{ personA: 'alex', personB: 'ben' }}
    `(
      'should return $key and $values when call getTranslations($typingList) [JPT-2391] 1/2/3',
      ({ typingList, key, values }) => {
        const typingIndicator = new TypingIndicator({
          show: true,
          typingList: [],
        });
        const actual = typingIndicator.getTranslations(typingList);
        expect(actual).toEqual({ key, values });
      },
    );
  });
});
