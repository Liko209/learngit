// import { WithNamespaces } from 'react-i18next';
enum ID_TYPE  {
  TEAM = 'TEAM',
  GROUP = 'GROUP',
  PERSON = 'PERSON',
}
type ProfileBodyProps = {
  id: number;
  displayName?: string;
};

export { ProfileBodyProps, ID_TYPE };
