/**
 * @typedef SendSmsMessageProps
 * @property {SMSCampaignData} smsCampaign
 */

import {useFormData} from "../editor/FormEditor";
import {Button, Col, Form, Row, Spinner} from "react-bootstrap";
import {useEffect, useState} from "react";
import {useAuth} from "../../auth/AuthProvider";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import './SendSmsMessageFields.css';

/**
 *
 * @param props{SendSmsMessageProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function SendSmsMessageFields(props) {

  const campaign = props.smsCampaign;
  const formData = useFormData();
  const {currentUser} = useAuth();
  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const [messageSending, setMessageSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageResult, setMessageResult] = useState(null);
  const [successCount, setSuccessCount] = useState(0);
  const [messageLog, setMessageLog] = useState([]);
  const [failureCount, setFailureCount] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const smsSuffix = `Reply STOP to unsubscribe.`;

  function isDataValid() {
    return formData.edits.title?.length > 0 && formData.edits.message?.length > 0 && formData.edits.message?.match(/[.?!]$/);
  }

  function sendMessage() {
    const data = {
      SMSCampaignID: campaign.SMSCampaignID,
      UserID: currentUser.UserID,
      ...formData.edits,
    }
    setMessageSending(true);
    SMS.sendSmsMessage(data).then((result) => {
      setMessageSent(true);
      setMessageSending(false);
      setMessageResult(result);
    }).catch((err) => {
      showErrorAlert(err);
      setMessageSending(false);
    })
  }

  useEffect(() => {
    if (messageResult && messageResult.Log) {
      let successCount = 0;
      let failureCount = 0;
      /** @type {[SMSMessageResult]} */
      const log = JSON.parse(messageResult.Log);
      for (const logEntry of log) {
        if (logEntry.Error) {
          failureCount++;
        } else {
          successCount++;
        }
      }
      setMessageLog(log);
      setSuccessCount(successCount);
      setFailureCount(failureCount);
    }
  },[messageResult])

  return <div className="container-fluid">
    <Row>
      <Col>
        <h2>Send Messages to {campaign.CampaignName} Subscribers</h2>
      </Col>
    </Row>
    {messageSent ?
      <>
        <Row className={'mt-2'}><Col><p>Your message was sent to {successCount} subscriber(s). {failureCount} error(s) occurred.</p></Col></Row>
        {showLog && <Row className={'mt-2'}>
          <Col>
            {messageLog.map((logEntry) => {
              return <div className={logEntry.Error ? "text-danger" : "text-success"}>{logEntry.Subscriber} {logEntry.Error}</div>
            })}
          </Col>
        </Row>}
        <Row className={'mt-2'}><Col>
          <Button variant={"secondary"} style={{marginRight:"10px"}} onClick={() => setShowLog(!showLog)}>{showLog ? <span>Hide Details</span> : <span>Show Details</span>}</Button>
          <Button onClick={() => setMessageSent(false)}>Send Another
          Message</Button>
        </Col></Row>
      </>
      :
      <>
        <Row className={'mt-2'}>
          <Col>
            <Form.Label
              column={'sm'}
              className={'required'}
              htmlFor={'title'}
            >
              Title for Email Version
            </Form.Label>
            <Form.Control
              name="title"
              id="title"
              size="sm"
              type="text"
              value={formData.edits.title?.length > 0 ? formData.edits.title : ''}
              isValid={formData.isTouched('title') && formData.edits.title?.length > 0}
              isInvalid={formData.isTouched('title') && !(formData.edits.title?.length > 0)}
              onChange={(e) => formData.onDataChanged({name: 'title', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row className={'mt-2'}>
          <Col>
            <Form.Label
              column={'sm'}
              className={'required'}
              htmlFor={'message'}
            >
              Message Text
            </Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              size={'sm'}
              name={'message'}
              value={formData.edits.message?.length > 0 ? formData.edits.message : ''}
              isValid={formData.isTouched('message') && formData.edits.message?.length > 0 && formData.edits.message?.match(/[.?!]$/)}
              isInvalid={formData.isTouched('message') && (!(formData.edits.message?.length > 0) || !formData.edits.message?.match(/[.?!]$/))}
              onChange={(e) => formData.onDataChanged({name: 'message', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row><Col className={"small text-secondary"}>End your message with punctuation (.?!) to ensure readability.</Col></Row>
        <Row>
          <Col sm={6} className={'mt-3'}>
            <h6>SMS Preview</h6>
            <div style={{padding: '15px', marginRight: '10px', backgroundColor: '#606060'}}
                 className={'small text-light rounded-3 position-relative bubble-bottom-right'}>
              {campaign.CampaignName}: <span className={'text-light'} dangerouslySetInnerHTML={{__html:formData.edits.message?.replaceAll('\n','<br/>')}}></span> {smsSuffix}
            </div>
          </Col>
          <Col sm={6} className={'mt-3'}>
            <h6>Email Preview</h6>
            <div style={{backgroundColor: '#dddddd', padding: '15px'}} className={'small text-black'}>
              <div><strong>To: Subscriber &lt;subscriber@whatever.com&gt;</strong></div>
              <div className={'mt-2'}><strong>From: {campaign.CampaignName} &lt;{campaign.CampaignEmail}&gt;</strong>
              </div>
              <div className={'mt-2'}><strong>Subject: [{campaign.CampaignName}] {formData.edits.title}</strong></div>
              <div className={'mt-2'}>{formData.edits.message}</div>
              <div className={'mt-2'}>You are receiving this email because you opted in to
                receive {campaign.CampaignName} notifications. <span className={'text-decoration-underline text-dark'}>Click here to unsubscribe.</span>
              </div>
            </div>
          </Col>
        </Row>
        <Row className={'mt-4'}>
          <Col>
            <Button
              disabled={!isDataValid() || messageSending}
              onClick={sendMessage}
              style={{width: '150px'}}
            >
              {messageSending ? <Spinner animation="border" size="sm"/> : <span>Send Message</span>}
            </Button>
          </Col>
        </Row>
      </>
    }
  </div>
}