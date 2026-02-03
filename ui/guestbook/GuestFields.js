import AddressFields from "../forms/AddressFields";
import PhoneNumberField from "../forms/PhoneNumberField";
import EmailField from "../forms/EmailField";
import {Col, Row, Form} from "react-bootstrap";

/**
 * Display guest fields from the guest book database.
 *
 * @param guestBookConfig {GuestBookConfig}
 * @param guestData {GuestData}
 * @param onChange {DataCallback}
 * @param labelCols {Number}
 * @constructor
 */
function GuestFields({guestBookConfig, guestData, onChange, labelCols}) {
  if (!labelCols) {
    labelCols = 2;
  }
  return (
    <>
      {guestBookConfig?.ShowName && (<>
        <Row>
          <Col sm={6}>
            <Form.Label htmlFor="FirstName" className={'required text-nowrap'} column={true} sm={labelCols}>First
              Name</Form.Label>
            <Form.Control
              isValid={guestData.FirstName != null && guestData.FirstName?.length > 0}
              isInvalid={guestData.FirstName?.length === 0}
              id="FirstName"
              size="20"
              value={guestData.FirstName || ''}
              onChange={e => onChange({
                name: 'FirstName',
                value: e.target.value
              })}
              onBlur={e => onChange({
                name: 'FirstName',
                value: e.target.value
              })}
            />
          </Col>
          <Col sm={6}>
            <Form.Label htmlFor="LastName" className={'required text-nowrap'} sm={labelCols} column={true}>Last
              Name</Form.Label>
            <Form.Control
              isValid={guestData.LastName != null && guestData.LastName?.length > 0}
              isInvalid={guestData.LastName?.length === 0}
              id="LastName"
              size="20"
              value={guestData.LastName || ''}
              onChange={e => onChange({
                name: 'LastName',
                value: e.target.value
              })}
              onBlur={e => onChange({
                name: 'LastName',
                value: e.target.value
              })}
            />
          </Col>
        </Row>
      </>)}
      {guestBookConfig?.ShowAddress && (
          <AddressFields address={guestData} onChange={(data) => onChange(data)}/>
      )}
      {guestBookConfig?.ShowDayPhone && (
        <Row className={"mt-2"}>
          <Col sm={6}>
            <Form.Label htmlFor="DayPhone" column={true} sm={labelCols}>Phone</Form.Label>
            <PhoneNumberField
              name="DayPhone"
              id="DayPhone"
              value={guestData.DayPhone || ''}
              onChange={onChange}
            />
          </Col>
        </Row>
      )}
      {guestBookConfig?.ShowEveningPhone && (
        <Row className={"mt-2"}>
          <Col sm={6}>
            <Form.Label htmlFor="EveningPhone" column={true} sm={labelCols}>Mobile Phone</Form.Label>
            <PhoneNumberField
              name="EveningPhone"
              id="EveningPhone"
              value={guestData.EveningPhone || ''}
              onChange={onChange}
            />
          </Col>
        </Row>
      )}
      {guestBookConfig?.ShowFax && (
        <Row className={"mt-2"}>
          <Col sm={6}>
            <Form.Label htmlFor="Fax" column={true} sm={labelCols}>Alternate</Form.Label>
            <PhoneNumberField
              name="Fax"
              id="Fax"
              value={guestData.Fax || ''}
              onChange={onChange}
            />
          </Col>
        </Row>
      )}
      {guestBookConfig?.ShowEmail && (
        <Row className={"mt-2"}>
          <Col sm={6}>
            <Form.Label className="required" column={true}>Email</Form.Label>
            <EmailField
              name="Email"
              id="Email"
              size="30"
              value={guestData.Email}
              onChange={(e) => onChange({name: 'Email', value: e.target.value})}
              onBlur={(e) => onChange({name: 'Email', value: e.target.value})}
              maxLength="50"
              required={true}
            />
          </Col>
        </Row>
      )}
      {guestBookConfig?.ShowContactInfo && (<>
        <Row className={"mt-4"}>
          <Form.Label htmlFor="ContactMethod" column={true} sm={'auto'}>Contact By</Form.Label>
          <Col sm={3}>
            <Form.Select
              id="ContactMethod"
              value={guestData?.ContactMethod || ''}
              onChange={(e) => onChange({name: 'ContactMethod', value: e.target.value})}
            >
              {guestBookConfig?.ShowEmail && (<option>Email</option>)}
              {guestBookConfig?.ShowDayPhone && (<option>Phone</option>)}
              {guestBookConfig?.ShowEveningPhone && (<option>Mobile</option>)}
              {guestBookConfig?.ShowFax && (<option>Alternate</option>)}
            </Form.Select>
          </Col>
        </Row>
      </>)}
      {guestBookConfig?.ShowMailingList && (
        <Row className={"mt-2"}>
          <Col>
            <Form.Check
              name="MailingList"
              id="mailinglist"
              value="1"
              label={"Add me to the mailing list"}
              checked={guestData.MailingList ? guestData.MailingList : guestBookConfig.MailingListDefault}
              onChange={e => onChange({name: 'MailingList', value: e.target.checked})}
            />
          </Col>
        </Row>
      )}
    </>
  )
}

export default GuestFields;