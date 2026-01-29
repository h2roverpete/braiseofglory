import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

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
    />
  )
}

export default PhoneNumberField;