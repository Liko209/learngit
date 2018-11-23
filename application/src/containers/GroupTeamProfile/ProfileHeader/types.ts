// import { WithNamespaces } from 'react-i18next';
// import { TranslationFunction } from 'i18next';

type ProfileHeaderVMProps = {
  id: number;
};

type ProfileHeaderViewProps = {
  text?: string;
  destroy: () => void;
  id: number;
};
export { ProfileHeaderViewProps, ProfileHeaderVMProps };
