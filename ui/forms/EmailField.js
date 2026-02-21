import {Form} from "react-bootstrap";
import {useState} from "react";
import {isValidEmail} from "../../util/Validators";

/**
 * Insert a form control that validates a user-entered email address.
 *
 * NOTE: Pass the value as NULL if you want the initial state of the control
 * to be unverified. Empty strings will be flagged as invalid input.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default function EmailField(props) {
  const [touched, setTouched] = useState(false);
  return (
    <Form.Control
      {...props}
      type="email"
      autoComplete="email"
      value={props.value || ''}
      onChange={(e)=>{
        setTouched(true);
        props.onChange?.(e);
      }}
      onBlur={(e)=>{
        setTouched(true);
        props.onBlur?.(e);
      }}
      isValid={touched && isValidEmail(props.value)}
      isInvalid={(props.value === '' && props.required) || (props.value?.length > 0 && !isValidEmail(props.value))}
    />
  )
}