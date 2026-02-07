import {useGuestBook} from "./GuestBook";
import {useEdit} from "../editor/EditProvider";
import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import EmailField, {isValidEmail} from "../forms/EmailField";
import {useRestApi} from "../../api/RestApi";
import CustomFieldsConfig from "./CustomFieldsConfig";
import {usePageContext} from "../content/Page";
import EditorPanel from "../editor/EditorPanel";
import {useFormEditor} from "../editor/FormEditor";

export default function GuestBookConfig({extraId, buttonRef}) {

  const {guestBookConfig, setGuestBookConfig} = useGuestBook();
  const {canEdit} = useEdit();
  const {GuestBooks, Extras} = useRestApi();
  const {removeExtraFromPage} = usePageContext();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const {edits, FormData} = useFormEditor();
  useEffect(() => {
    FormData?.update(guestBookConfig);
  },[guestBookConfig]);
  
  if (!canEdit) {
    return <></>;
  }
  
  function isDataValid() {
    return edits?.GuestBookName?.length > 0 && isValidEmail(edits?.GuestBookEmail) && areCustomFieldsValid()
  }

  function areCustomFieldsValid() {
    for (let i = 0; i <= 8; i++) {
      if (edits[`Custom${i}Type`]?.length > 0 && !edits[`Custom${i}Label`]) {
        return false;
      }
    }
    return true;
  }

  function onUpdate() {
    console.debug(`Updating guest book config...`);
    GuestBooks.insertOrUpdateGuestBook(edits)
      .then(response => {
        console.debug(`Guest book config updated.`);
        FormData?.update(response);
        setGuestBookConfig(response);
      })
      .catch(error => {
        console.error(`Error updating guest book config.`, error);
      })
  }

  function onDeleteExtra() {
    if (extraId) {
      console.debug(`Deleting extra ${extraId} from page.`);
      Extras.deleteExtra(extraId).then(() => {
        console.debug(`Extra deleted.`);
        removeExtraFromPage(extraId);
      }).catch(error => {
        console.error(`Error deleting extra.`, error);
      })
    }
  }

  /**
   * Enable another custom field.
   */
  function addCustomField() {
    for (let i = 1; i <= 8; i++) {
      if (!edits[`Custom${i}Type`]) {
        console.debug(`Adding custom field at position ${i}`);
        FormData?.update({
          ...edits,
          [`Custom${i}Label`]: '',
          [`Custom${i}Type`]: 'text',
          [`Custom${i}Options`]: '',
          [`Custom${i}Required`]: false,
        });
        break;
      }
    }
  }

  /**
   * How many custom fields are in use?
   * @returns {number} Index of last custom field
   */
  function lastCustomField() {
    let last = 0;
    for (let i = 1; i <= 8; i++) {
      if (edits[`Custom${i}Type`]) {
        last = i;
      }
    }
    return last;
  }

  return (<>
    <EditorPanel
      onUpdate={onUpdate}
      onDelete={()=>setShowDeleteConfirmation(true)}
      isDataValid={isDataValid}
      buttonRef={buttonRef}
      extraButtons={<>
        <Button
          className="me-2"
          variant="secondary"
          size="sm"
          disabled={lastCustomField() >= 8}
          onClick={addCustomField}
        >
          <span className={'d-none d-sm-block'}>Add a Field</span>
          <span className={'d-block d-sm-none'}>+Field</span>
        </Button>
        {extraId && (
          <Button
            className="me-2"
            variant="secondary"
            size="sm"
            onClick={() => onDeleteExtra()}
          >
            <span className={'d-none d-sm-block'}>Remove from Section</span>
            <span className={'d-block d-sm-none'}>Remove</span>
          </Button>
        )}
      </>}
    >
      <Row><Col><h5>Guest Book Properties</h5></Col></Row>
      <Row>
        <Col>
          <Form.Label
            size={"sm"}
            htmlFor={'GuestBookName'}
            column={'sm'}
            className="required"
          >
            Guest Book Name (Title for Emails)
          </Form.Label>
          <Form.Control
            size={"sm"}
            id={'GuestBookName'}
            value={edits?.GuestBookName || ''}
            isInvalid={FormData?.isTouched('GuestBookName') && edits?.GuestBookName?.length === 0}
            isValid={FormData?.isTouched('GuestBookName') && edits?.GuestBookName?.length > 0}
            onChange={(e) => FormData?.onDataChanged({name: 'GuestBookName', value: e.target.value})}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Form.Label
            column={'sm'}
            htmlFor={'GuestBookEmail'}
            className="required"
          >
            Send Feedback Emails To
          </Form.Label>
          <EmailField
            id={'GuestBookEmail'}
            size={'sm'}
            value={edits?.GuestBookEmail}
            required={true}
            onChange={(e) => FormData?.onDataChanged({name: 'GuestBookEmail', value: e.target.value})}
          />
        </Col>
        <Col sm={6}>
          <Form.Label
            htmlFor={'GuestBookCCEmail'}
            column={'sm'}
          >
            CC Feedback Emails To
          </Form.Label>
          <EmailField
            size={'sm'}
            id={'GuestBookCCEmail'}
            value={edits?.GuestBookCCEmail}
            onChange={(e) => FormData?.onDataChanged({name: 'GuestBookCCEmail', value: e.target.value})}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Check
            checked={edits?.AlwaysEmail || false}
            className={'form-control-sm'}
            label={'Always send email to admins, even without feedback'}
            onChange={(e) => FormData?.onDataChanged({name: 'AlwaysEmail', value: e.target.checked})}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Label
            size={"sm"}
            htmlFor={'GuestBookMessage'}
            column={'sm'}
          >
            Before Submit Message
          </Form.Label>
          <Form.Control
            as={"textarea"}
            size={"sm"}
            id={'GuestBookMessage'}
            value={edits?.GuestBookMessage || ''}
            placeholder={'Please enter your information below.'}
            rows={3}
            onChange={(e) => FormData?.onDataChanged({name: 'GuestBookMessage', value: e.target.value})}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Label
            size={"sm"}
            htmlFor={'DoneMessage'}
            column={'sm'}
          >
            After Submit Message
          </Form.Label>
          <Form.Control
            as={"textarea"}
            size={"sm"}
            id={'DoneMessage'}
            value={edits?.DoneMessage || ''}
            rows={3}
            placeholder={'Your information has been submitted.'}
            onChange={(e) => FormData?.onDataChanged({name: 'DoneMessage', value: e.target.value})}
          />
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          <Form.Label
            size={"sm"}
            htmlFor={'SubmitButtonName'}
            column={'sm'}
          >
            Submit Button Label
          </Form.Label>
          <Form.Control
            size={"sm"}
            id={'SubmitButtonName'}
            value={edits?.SubmitButtonName || ''}
            placeholder={'Submit'}
            onChange={(e) => FormData?.onDataChanged({name: 'SubmitButtonName', value: e.target.value})}
          />
        </Col>
        <Col sm={6}>
          <Form.Label
            size={"sm"}
            htmlFor={'AgainMessage'}
            column={'sm'}
          >
            Submit Again Button Label
          </Form.Label>
          <Form.Control
            size={"sm"}
            id={'AgainMessage'}
            value={edits?.AgainMessage || ''}
            placeholder={'Submit Again'}
            onChange={(e) => FormData?.onDataChanged({name: 'AgainMessage', value: e.target.value})}
          />
        </Col>
      </Row>
      <Row className="mt-2">
        <Col sm={6}>
          <Form.Label
            size={"sm"}
            htmlFor={'TextCaption'}
            column={'sm'}
          >
            Feedback Prompt
          </Form.Label>
          <Form.Control
            size={"sm"}
            id={'TextCaption'}
            value={edits?.TextCaption || ''}
            placeholder={'Questions or Comments'}
            disabled={!edits?.ShowFeedback}
            onChange={(e) => FormData?.onDataChanged({name: 'TextCaption', value: e.target.value})}
          />
        </Col>
        <Col sm={6}>
          <Form.Label
            size={"sm"}
            htmlFor={"LabelCols"}
            column={'sm'}
          >
            Label Width
          </Form.Label>
          <Form.Select
            id={'LabelCols'}
            value={edits?.LabelCols || '2'}
            size={"sm"}
            onChange={(e) => FormData?.onDataChanged({name: 'LabelCols', value: parseInt(e.target.value)})}
          >
            <option value={'2'}>2 Columns</option>
            <option value={'3'}>3 Columns</option>
            <option value={'4'}>4 Columns</option>
            <option value={'5'}>5 Columns</option>
            <option value={'6'}>6 Columns</option>
          </Form.Select>
        </Col>
      </Row>
      <Row className="mt-2">
        <Form.Label column={'sm'} sm={2}>Show Inputs:</Form.Label>
        <Col sm={3}>
          <Form.Check
            checked={edits?.ShowName || false}
            className={'form-control-sm'}
            label={'Name'}
            onChange={(e) => FormData?.onDataChanged({name: 'ShowName', value: e.target.checked})}
          />
          <Form.Check
            checked={edits?.ShowDayPhone || false}
            className={'form-control-sm'}
            label={'Phone'}
            onChange={(e) => FormData?.onDataChanged({name: 'ShowDayPhone', value: e.target.checked})}
          />
          <Form.Check
            checked={edits?.ShowEmail || false}
            className={'form-control-sm'}
            label={'Email'}
            onChange={(e) => FormData?.onDataChanged({name: 'ShowEmail', value: e.target.checked})}
          />
          <Form.Check
            checked={edits?.ShowFeedback || false}
            className={'form-control-sm'}
            label={'Feedback'}
            onChange={(e) => FormData?.onDataChanged({name: 'ShowFeedback', value: e.target.checked})}
          />
        </Col>
        <Col sm={3}>
          <Form.Check
            checked={edits?.ShowAddress || false}
            className={'form-control-sm'}
            label={'Address'}
            onChange={(e) => FormData?.onDataChanged({name: 'ShowAddress', value: e.target.checked})}
          />
          <Form.Check
            checked={edits?.ShowContactInfo || false}
            className={'form-control-sm'}
            label={'Contact Method'}
            onChange={(e) => FormData?.onDataChanged({name: 'ShowContactInfo', value: e.target.checked})}
          />
          <Form.Check
            checked={edits?.ShowMailingList || false}
            className={'form-control-sm'}
            label={'Mailing List'}
            onChange={(e) => FormData?.onDataChanged({name: 'ShowMailingList', value: e.target.checked})}
          />
        </Col>
        <Col>
          <Form.Check
            checked={edits?.ShowEveningPhone || false}
            className={'form-control-sm'}
            label={'Mobile Phone'}
            onChange={(e) => FormData?.onDataChanged({name: 'ShowEveningPhone', value: e.target.checked})}
          />
          <Form.Check
            checked={edits?.ShowFax || false}
            className={'form-control-sm'}
            label={'Alternate Phone'}
            onChange={(e) => FormData?.onDataChanged({name: 'ShowFax', value: e.target.checked})}
          />
          <Form.Check
            checked={edits?.ShowLodgingFields || false}
            className={'form-control-sm'}
            label={'Lodging Fields'}
            onChange={(e) => FormData?.onDataChanged({name: 'ShowLodgingFields', value: e.target.checked})}
          />
        </Col>
      </Row>

      {edits?.ShowMailingList && (
        <Row className="mt-2">
          <Col>
            <Form.Check
              checked={edits?.MailingListDefault || false}
              className={'form-control-sm'}
              label={'Mailing list checked by default'}
              onChange={(e) => FormData?.onDataChanged({name: 'MailingListDefault', value: e.target.checked})}
            />
          </Col>
        </Row>
      )}
      <CustomFieldsConfig guestBookConfig={edits} onChange={FormData?.onDataChanged}/>
    </EditorPanel>

    <Modal
      show={showDeleteConfirmation}
      onHide={() => setShowDeleteConfirmation(false)}
      className={'Editor'}
    >
      <Modal.Header><h5>Delete Guest Book</h5></Modal.Header>
      <Modal.Body>Are you sure you want to delete the guest book? This action can't be undone.</Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
        <Button size="sm" variant="danger" onClick={() => {
          GuestBooks.deleteGuestBook(guestBookConfig?.GuestBookID).then(() => {
            console.debug('Guest book deleted.');
            if (extraId) {
              Extras.deleteExtra(extraId).then(() => {
                console.debug('Guest book extra deleted.');
                setShowDeleteConfirmation(false);
                removeExtraFromPage(extraId);
              }).catch(err => console.error('Guest book extra delete error.', err));
            }
          }).catch(err => {
            console.error('Guest book delete error.', err);
          })
        }}>Delete</Button>
      </Modal.Footer>
    </Modal>

  </>);
}