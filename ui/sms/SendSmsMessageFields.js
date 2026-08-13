import {useFormData} from "../editor/FormEditor";
import {Button, Col, Form, Row, Spinner} from "react-bootstrap";
import {useEffect, useState} from "react";
import {useAuth} from "../../auth/AuthProvider";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import './TextMessagePreview.css';
import SmsMessagePreview from "./SmsMessagePreview";

/**
 * Display the fields for sending an SMS message.
 * NOTE: must be enclosed by a <FormEditor> tag.
 *
 * @param campaign {SMSCampaignData}
 * @returns {JSX.Element}
 * @constructor
 */
export default function SendSmsMessageFields({campaign}) {

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

  useEffect(() => {
    if (!formData.edits.SMSCampaignID) {
      formData.edits.SMSCampaignID = campaign.SMSCampaignID;
    }
    if (!formData.edits.UserID && currentUser?.UserID) {
      formData.edits.UserID = currentUser?.UserID;
    }
  }, [formData, currentUser, campaign.SMSCampaignID]);

  function isDataValid() {
    return formData.edits.Title?.length > 0 && formData.edits.Message?.length > 0 && formData.edits.Message?.match(/[.?!]$/);
  }

  function sendMessage() {
    setMessageSending(true);
    SMS.sendSmsMessage(formData.edits).then((result) => {
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
  }, [messageResult])

  return <>
    {campaign && <>
      {messageSent ?
        <>
          <Row className={'mt-2'}><Col><p>Your message was sent to {successCount} subscriber(s). {failureCount} error(s)
            occurred.</p></Col></Row>
          {showLog && <Row className={'mt-2'}>
            <Col>
              {messageLog.map((logEntry) => {
                return <div
                  className={logEntry.Error ? "text-danger" : "text-success"}>{logEntry.Subscriber} {logEntry.Error}</div>
              })}
            </Col>
          </Row>}
          <Row className={'mt-2'}><Col>
            <Button variant={"secondary"} style={{marginRight: "10px"}} onClick={() => setShowLog(!showLog)}>{showLog ?
              <span>Hide Details</span> : <span>Show Details</span>}</Button>
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
                htmlFor={'Title'}
              >
                Title for Email Version
              </Form.Label>
              <Form.Control
                name="Title"
                id="Title"
                size="sm"
                type="text"
                value={formData.edits.Title?.length > 0 ? formData.edits.Title : ''}
                isValid={formData.isTouched('Title') && formData.edits.Title?.length > 0}
                isInvalid={formData.isTouched('Title') && !(formData.edits.Title?.length > 0)}
                onChange={(e) => formData.onDataChanged({name: 'Title', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Col>
              <Form.Label
                column={'sm'}
                className={'required'}
                htmlFor={'Message'}
              >
                Message Text
              </Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                size={'sm'}
                name={'Message'}
                value={formData.edits.Message?.length > 0 ? formData.edits.Message : ''}
                isValid={formData.isTouched('Message') && formData.edits.Message?.length > 0 && formData.edits.Message?.match(/[.?!]$/)}
                isInvalid={formData.isTouched('Message') && (!(formData.edits.Message?.length > 0) || !formData.edits.Message?.match(/[.?!]$/))}
                onChange={(e) => formData.onDataChanged({name: 'Message', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row><Col className={"small text-secondary"}>End your message with punctuation (.?!) to ensure
            readability.</Col></Row>
          <SmsMessagePreview campaign={campaign} message={formData.edits} />
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
    </>}
  </>
}