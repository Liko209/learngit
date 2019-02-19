import {
  TextFieldProps,
  OutlinedTextFieldProps,
} from '@material-ui/core/TextField';

function isOutlinedTextFieldProps(
  textFieldProps: TextFieldProps,
): textFieldProps is OutlinedTextFieldProps {
  return textFieldProps.variant === 'outlined';
}

export default isOutlinedTextFieldProps;
