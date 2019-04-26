import CodeSnippetItem from '@/store/models/CodeItem';

export type CodeSnippetViewModelProps = {
  ids: number[];
};

export type CodeSnippetViewProps = {
  postItem: CodeSnippetItem;
  body: string;
  isCollapse: boolean;
  setCollapse: (isCollapse: boolean) => void;
};
