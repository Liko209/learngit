## JuiModal.open

> JuiModal.open(YourComponent, [JuiDialogProps]);

### example

```javascript
const Test = (props: { dismiss: () => void }) => {
  const { dismiss } = props;
  return <div onClick={dismiss}>123</div>;
};

JuiModal.open(Test);

const Test1 = JuiModal.open(Test, { size: "large" });
Test1.dismiss();

// But also we can pass props to component use componentProps
JuiModal.open(Test, {
  componentProps: {
    id: 123
  }
});
```

## JuiModal.alert && JuiModal.confirm

> JuiModal.alert(JuiModalProps) && JuiModal.confirm(JuiModalProps)

### example

```javascript
// alert
const alert = JuiModal.alert({
  content,
  title: t("auth.signInFailedTitle"),
  onOK: () => {
    this.onClose();
  }
});
alert.dismiss();

// confirm
JuiModal.confirm({
  title: t("message.prompt.deletePostTitle"),
  content: t("message.prompt.deletePostContent"),
  okText: t("common.dialog.delete"),
  cancelText: t("common.dialog.cancel"),
  async onOK() {
    try {
      await deletePost();
    } catch (e) {
      console.log(e);
    }
  }
});
```
