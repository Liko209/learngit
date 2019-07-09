type BaseItemProps = {
  onMouseOver?: () => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
  hovered?: boolean;
};

export { BaseItemProps };
