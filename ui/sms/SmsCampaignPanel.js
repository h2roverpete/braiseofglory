import {useFormData} from "../editor/FormEditor";
import {useEffect, useState} from "react";
import {Button, Col, Form, Row} from "react-bootstrap";
import PhoneNumberField from "../forms/PhoneNumberField";
import {useRestApi} from "../../api/RestApi"
import {useSiteContext} from "../content/Site";


/**
 * Display message that the user doesn't have permission to view the content.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsCampaignPanel({smsCampaignId}) {

  const [smsCampaignConfig, setSmsCampaignConfig] = useState();
  const {SMS} = useRestApi();
  const [submitted, setSubmitted] = useState(false);
  const {showErrorAlert} = useSiteContext();

  const formData = useFormData();
  useEffect(() => {
    if (!smsCampaignConfig) {
      SMS.getSmsCampaign(smsCampaignId).then((response) => {
        setSmsCampaignConfig(response);
      }).catch((error) => showErrorAlert(error));
    }
  })

  function isDataValid() {
    const number = formData.edits.SubscriberMobileNumber?.replaceAll(/[^0-9+]/g, "");
    return formData.edits.SubscriberName?.length > 0
      && number?.length === 12 && number.startsWith('+1')
      && formData.edits.Accept;
  }

  function handleSubmit() {
    const data = {
      SMSCampaignID: parseInt(smsCampaignId),
      SubscriberName: formData.edits.SubscriberName,
      SubscriberMobileNumber: formData.edits.SubscriberMobileNumber.replaceAll(/[^0-9+]/g, "")
    }
    SMS.insertOrUpdateSmsSubscriber(data).then((response) => {
      setSubmitted(true);
    }).catch(error => {
      showErrorAlert(`This number is already subscribed.`)
    });
  }

  function handleReset() {
    formData.reset();
    setSubmitted(false);
  }

  const labelCols = 3;
  if (!smsCampaignConfig) {
    return <></>
  } else return <div className="container-fluid SMSCampaign">
    {submitted ?
      <>
        <p className="SectionText">{smsCampaignConfig.CampaignConfirmation}</p>
        <p><Button
          variant={'primary'}
          onClick={(e) => handleReset()}
        >
          {smsCampaignConfig.CampaignResubmitButton ? <>{smsCampaignConfig.CampaignResubmitButton}</> : <>Submit Again</>}
        </Button>
        </p>
      </>
      :
      <>
        <Row className={'mt-2'}>
          <p className="SectionText" dangerouslySetInnerHTML={{__html: smsCampaignConfig.CampaignDescription}}></p>
        </Row>
        <Row className={'mt-2'}>
          <Form.Label
            column={'sm'}
            sm={labelCols}
            className={'required'}
            htmlFor={'SubscriberName'}
          >
            Name
          </Form.Label>
          <Col>
            <Form.Control
              size={'sm'}
              name={'SubscriberName'}
              isValid={formData.isTouched('SubscriberName') && formData.edits.SubscriberName?.length > 0}
              isInvalid={formData.isTouched('SubscriberName') && !(formData.edits.SubscriberName?.length > 0)}
              value={formData.edits?.SubscriberName || ''}
              onChange={(e) => formData.onDataChanged({name: 'SubscriberName', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row className={'mt-2'}>
          <Form.Label
            column={'sm'}
            sm={labelCols}
            htmlFor={'SubscriberMobileNumber'}
            className={'required'}
          >
            Mobile Number
          </Form.Label>
          <Col sm={7}>
            <PhoneNumberField
              size={'sm'}
              name={'SubscriberMobileNumber'}
              id={'SubscriberMobileNumber'}
              value={formData.edits?.SubscriberMobileNumber || ''}
              onChange={(data) => formData.onDataChanged(data)}
            />
          </Col>
        </Row>
        <Row className={'mt-4'}>
          <p className="SectionText" dangerouslySetInnerHTML={{__html:smsCampaignConfig.CampaignAgreement}}></p>
        </Row>
        <Row className={'mt-2'}>
          <Col sm={12}>
            <Form.Check
              type={'checkbox'}
              name={`Accept`}
              label={smsCampaignConfig.CampaignAgreementCheckBox}
              checked={formData.edits?.Accept || 0}
              onChange={(e) => formData.onDataChanged({name: 'Accept', value: e.target.checked})}
              inline
            />
          </Col>
        </Row>
        <div className="form-group mt-4">
          <Button
            variant={'primary'}
            disabled={!isDataValid()}
            onClick={(e) => handleSubmit(e)}
          >
            {smsCampaignConfig.CampaignSubmitButton ? <>{smsCampaignConfig.CampaignSubmitButton}</> : <>Submit</>}
          </Button>
        </div>
      </>}
  </div>;
}