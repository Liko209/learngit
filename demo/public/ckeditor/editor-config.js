CKEDITOR.editorConfig = function(config) {
  config.toolbarGroups = [
    { name: 'clipboard', groups: ['clipboard', 'undo'] },
    {
      name: 'editing',
      groups: ['find', 'selection', 'spellchecker', 'editing']
    },
    { name: 'forms', groups: ['forms'] },
    { name: 'document', groups: ['document', 'mode', 'doctools'] },
    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
    {
      name: 'paragraph',
      groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph']
    },
    { name: 'links', groups: ['links'] },
    { name: 'insert', groups: ['insert'] },
    { name: 'styles', groups: ['styles'] },
    { name: 'colors', groups: ['colors'] },
    { name: 'tools', groups: ['tools'] },
    { name: 'others', groups: ['others'] },
    { name: 'about', groups: ['about'] }
  ];

  config.removeButtons =
    'Subscript,Superscript,RemoveFormat,CopyFormatting,JustifyBlock,BidiLtr,BidiRtl,Language,Anchor,Flash,Smiley,SpecialChar,PageBreak,Iframe,Font,FontSize,ShowBlocks,About,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Redo,Copy,Paste,PasteText,PasteFromWord,Cut,Scayt,SelectAll,Templates,Source,Print,Preview,NewPage,Save,Replace,Find,CreateDiv,Maximize,Styles';
  config.contentsCss = '/ckeditor/editor-styles.css';
  config.enterMode = CKEDITOR.ENTER_BR;
};
