enum BUTTON_TYPE {
  ICON,
  MENU_ITEM,
}

type VoicemailActionsProps = {
  id: number;
  hookAfterClick: () => void;
};

type VoicemailActionsViewProps = {};

export { BUTTON_TYPE, VoicemailActionsProps, VoicemailActionsViewProps };
