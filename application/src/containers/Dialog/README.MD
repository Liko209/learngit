## JuiModal.open

> JuiModal.open(YourComponent, [JuiDialogProps]);

### example

```javascript
const Test = (props: any) => {
  const { destroy } = props;
  return <div onClick={destroy}>123</div>;
};

JuiModal.open(Test);

const Test1 = JuiModal.open(Test, { size: "large" });
Test1.destroy();

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
  title: t("signInFailedTitle"),
  onOK: () => {
    this.onClose();
  }
});
alert.destroy();

// confirm
JuiModal.confirm({
  title: t("deletePostTitle"),
  content: t("deletePostContent"),
  okText: t("deletePostOk"),
  cancelText: t("deletePostCancel"),
  async onOK() {
    try {
      await deletePost();
    } catch (e) {
      console.log(e);
    }
  }
});
```
