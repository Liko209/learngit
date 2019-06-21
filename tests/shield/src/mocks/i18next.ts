/* global jest */
const i18next: any = jest.genMockFromModule('react-i18next');
i18next.t = (i: any) => i;
i18next.translate = (c: any) => (k: any) => k;

export default i18next;
