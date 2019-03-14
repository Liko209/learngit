type TWithPostLikeProps = {
  postId: number;
};

type TComponentWithLikeProps = {
  iLiked: boolean;
  likedMembers: string[];
  onToggleLike(): void;
};

export { TWithPostLikeProps, TComponentWithLikeProps };
