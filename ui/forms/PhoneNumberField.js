import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import './PhoneNumberField.css'

/**
 * @callback StringCallback
 * @param value{String}
 */

/**
 * Form field for phone number input
 *
 * @param name{String}
 * @param id{String}
 * @param value{String}
 * @param onChange{StringCallback}
 * @constructor
 */
function PhoneNumberField({name, id, value, onChange}) {
  return (
    <PhoneInput
      inputProps={{
        name: name,
        required: false
      }}
      id={id}
      value={value}
      country={'us'}
      onChange={(value, country, e, formattedValue) => {
        onChange({
          name: name,
          value: formattedValue
        })
      }}
      dropdownClass={'dropdown'}
      inputClass={'phone'}
      inputStyle={{backgroundColor: 'var(--bs-body-bg)', width: '100%'}}
      buttonStyle={{backgroundColor: 'var(--bs-body-bg)'}}
      dropdownStyle={{backgroundColor: 'var(--bs-body-bg)'}}
    />
  )
}

export default PhoneNumberField;