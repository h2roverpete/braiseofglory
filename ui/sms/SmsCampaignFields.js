import {useFormData} from "../editor/FormEditor";
import {useEffect, useState} from "react";
import {Accordion, Button, Col, Form, Row} from "react-bootstrap";
import {useRestApi} from "../../api/RestApi"
import {useSiteContext} from "../content/Site";
import CrudButtons from "../editor/CrudButtons";
import EmailField from "../forms/EmailField";
import './SmsCampaignFields.css'
import {isValidEmail} from "../../util/Validators";

/**
 * Display message that the user doesn't have permission to view the content.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsCampaignFields(props) {

  const {SMS, Sites} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const formData = useFormData();
  const [sites, setSites] = useState();

  useEffect(() => {
    if (!sites) {
      Sites.getSites().then((response) => {
        response = response.sort((a, b) => a.SiteName.localeCompare(b.SiteName));
        setSites(response);
      }).catch((error) => showErrorAlert(error));
    }
  }, [sites, Sites])

  useEffect(() => {
    if (props.campaignData) {
      formData.setData(props.campaignData);
    }
  }, [props, formData]);

  function onUpdate() {
    SMS.insertOrUpdateSmsCampaign(formData.edits)
      .then((result) => {
        if (props.onUpdate) {
          props.onUpdate(result);
        }
      })
      .catch((error) => showErrorAlert(error));
  }

  function onDelete() {

  }

  function isDataValid() {
    return formData.edits.CampaignName?.length > 0
      && formData.edits.SiteID > 0
      && isValidEmail(formData.edits.CampaignAdminEmail)
      && formData.edits.CampaignDescription?.length > 0
      && formData.edits.CampaignAgreement?.length > 0
      && formData.edits.CampaignAgreementCheckBox?.length > 0
      && formData.edits.CampaignSubmitButton?.length > 0
      && formData.edits.CampaignConfirmation?.length > 0
      && formData.edits.CampaignResubmitButton?.length > 0

  }

  const labelCols = 3;
  return <div className="container-fluid mb-2">
    <Row className={'mt-2'}>
      <Col>
        <h5>SMS Campaign Configuration</h5>
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Form.Label
        column={'sm'}
        sm={labelCols}
        className={'required'}
        htmlFor={'CampaignName'}
      >
        Name
      </Form.Label>
      <Col>
        <Form.Control
          size={'sm'}
          name={'CampaignName'}
          isValid={formData.isTouched('CampaignName') && formData.edits.CampaignName?.length > 0}
          isInvalid={formData.isTouched('CampaignName') && !(formData.edits.CampaignName?.length > 0)}
          value={formData.edits?.CampaignName || ''}
          onChange={(e) => formData.onDataChanged({name: 'CampaignName', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Form.Label
        column={'sm'}
        sm={labelCols}
        className={'required'}
        htmlFor={'SiteID'}
      >
        Site
      </Form.Label>
      <Col>
        <Form.Select
          size={'sm'}
          name={'SiteID'}
          value={formData.edits?.SiteID || 0}
          onChange={(e) => formData.onDataChanged({name: 'SiteID', value: e.target.value})}
        >
          <option value={0}>(select a site)</option>
          {sites?.map((site) =>
            <option key={site.SiteID} value={site.SiteID}>
              {site.SiteName}
            </option>
          )}
        </Form.Select>
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Form.Label
        column={'sm'}
        sm={labelCols}
        className={'required'}
        htmlFor={'CampaignAdminEmail'}
      >
        Admin Email
      </Form.Label>
      <Col>
        <EmailField
          size={'sm'}
          name={'CampaignAdminEmail'}
          value={formData.edits?.CampaignAdminEmail || ''}
          onChange={(e) => formData.onDataChanged({name: 'CampaignAdminEmail', value: e.target.value})}
        />
      </Col>
    </Row>

    <Accordion defaultActiveKey={'0'} className={'mt-4'}>
      <Accordion.Item eventKey={'2'}>
        <Accordion.Header>
          Signup
        </Accordion.Header>
        <Accordion.Body>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              className={'required'}
              htmlFor={'CampaignDescription'}
            >
              Description (above input fields)
            </Form.Label>
            <Col>
              <Form.Control
                as={'textarea'}
                rows={8}
                size={'sm'}
                name={'CampaignDescription'}
                isValid={formData.isTouched('CampaignDescription') && formData.edits.CampaignDescription?.length > 0}
                isInvalid={formData.isTouched('CampaignDescription') && !(formData.edits.CampaignDescription?.length > 0)}
                value={formData.edits?.CampaignDescription || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignDescription', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              className={'required'}
              htmlFor={'CampaignAgreement'}
            >
              Agreement (below input fields)
            </Form.Label>
            <Col>
              <Form.Control
                as={'textarea'}
                rows={6}
                size={'sm'}
                name={'CampaignAgreement'}
                isValid={formData.isTouched('CampaignAgreement') && formData.edits.CampaignAgreement?.length > 0}
                isInvalid={formData.isTouched('CampaignAgreement') && !(formData.edits.CampaignAgreement?.length > 0)}
                value={formData.edits?.CampaignAgreement || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignAgreement', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              className={'required'}
              htmlFor={'CampaignAgreementCheckBox'}
            >
              Checkbox
            </Form.Label>
            <Col>
              <Form.Control
                size={'sm'}
                name={'CampaignAgreementCheckBox'}
                isValid={formData.isTouched('CampaignAgreementCheckBox') && formData.edits.CampaignAgreementCheckBox?.length > 0}
                isInvalid={formData.isTouched('CampaignAgreementCheckBox') && !(formData.edits.CampaignAgreementCheckBox?.length > 0)}
                value={formData.edits?.CampaignAgreementCheckBox || ''}
                placeholder={'I Agree'}
                onChange={(e) => formData.onDataChanged({name: 'CampaignAgreementCheckBox', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              className={'required'}
              htmlFor={'CampaignSubmitButton'}
            >
              Submit Button
            </Form.Label>
            <Col>
              <Form.Control
                size={'sm'}
                name={'CampaignSubmitButton'}
                isValid={formData.isTouched('CampaignSubmitButton') && formData.edits.CampaignSubmitButton?.length > 0}
                isInvalid={formData.isTouched('CampaignSubmitButton') && !(formData.edits.CampaignSubmitButton?.length > 0)}
                value={formData.edits?.CampaignSubmitButton || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignSubmitButton', value: e.target.value})}
                placeholder={'Subscribe'}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              className={'required'}
              htmlFor={'CampaignConfirmation'}
            >
              Confirmation
            </Form.Label>
            <Col>
              <Form.Control
                as={'textarea'}
                rows={3}
                size={'sm'}
                name={'CampaignConfirmation'}
                isValid={formData.isTouched('CampaignConfirmation') && formData.edits.CampaignConfirmation?.length > 0}
                isInvalid={formData.isTouched('CampaignConfirmation') && !(formData.edits.CampaignConfirmation?.length > 0)}
                value={formData.edits?.CampaignConfirmation || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignConfirmation', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              className={'required'}
              htmlFor={'CampaignResubmitButton'}
            >
              Resubmit Button
            </Form.Label>
            <Col>
              <Form.Control
                size={'sm'}
                name={'CampaignResubmitButton'}
                isValid={formData.isTouched('CampaignResubmitButton') && formData.edits.CampaignResubmitButton?.length > 0}
                isInvalid={formData.isTouched('CampaignResubmitButton') && !(formData.edits.CampaignResubmitButton?.length > 0)}
                value={formData.edits?.CampaignResubmitButton || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignResubmitButton', value: e.target.value})}
                placeholder={'Subscribe Another Number'}
              />
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey={'1'}>
        <Accordion.Header>
          SMS Messages
        </Accordion.Header>
        <Accordion.Body>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              className={'required'}
              htmlFor={'CampaignConfirmationMessage'}
            >
              Confirmation
            </Form.Label>
            <Col>
              <Form.Control
                as={'textarea'}
                rows={3}
                size={'sm'}
                name={'CampaignConfirmationMessage'}
                isValid={formData.isTouched('CampaignConfirmationMessage') && formData.edits.CampaignConfirmationMessage?.length > 0}
                isInvalid={formData.isTouched('CampaignConfirmationMessage') && !(formData.edits.CampaignConfirmationMessage?.length > 0)}
                value={formData.edits?.CampaignConfirmationMessage || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignConfirmationMessage', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              className={'required'}
              htmlFor={'CampaignHelpMessage'}
            >
              Help
            </Form.Label>
            <Col>
              <Form.Control
                as={'textarea'}
                rows={3}
                size={'sm'}
                name={'CampaignHelpMessage'}
                isValid={formData.isTouched('CampaignHelpMessage') && formData.edits.CampaignHelpMessage?.length > 0}
                isInvalid={formData.isTouched('CampaignHelpMessage') && !(formData.edits.CampaignHelpMessage?.length > 0)}
                value={formData.edits?.CampaignHelpMessage || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignHelpMessage', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              className={'required'}
              htmlFor={'CampaignStopMessage'}
            >
              Stop
            </Form.Label>
            <Col>
              <Form.Control
                as={'textarea'}
                rows={3}
                size={'sm'}
                name={'CampaignStopMessage'}
                isValid={formData.isTouched('CampaignStopMessage') && formData.edits.CampaignStopMessage?.length > 0}
                isInvalid={formData.isTouched('CampaignStopMessage') && !(formData.edits.CampaignStopMessage?.length > 0)}
                value={formData.edits?.CampaignStopMessage || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignStopMessage', value: e.target.value})}
              />
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
    <CrudButtons
      data={formData.edits}
      keyName={'SMSCampaignID'}
      type={'Campaign'}
      onCancel={props.onCancel}
      onUpdate={onUpdate}
      onDelete={props.onDelete ? onDelete : undefined}
      isDataValid={isDataValid}
    />
  </div>;
}