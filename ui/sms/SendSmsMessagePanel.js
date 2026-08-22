import {Button, Col, Form, Row, Spinner} from "react-bootstrap";
import {useEffect, useState} from "react";
import {useAuth} from "../../auth/AuthProvider";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import './TextMessagePreview.css';
import SmsMessagePreview from "./SmsMessagePreview";
import SmsSubscriberList from "./SmsSubscriberList";
import {useFormData} from "../editor/FormEditor";
import './SendSmsMessagePanel.css';

/**
 * Display the fields for sending an SMS message.
 *
 * @param campaign {SMSCampaignData}
 * @returns {JSX.Element}
 * @constructor
 */
export default function SendSmsMessagePanel({campaign}) {

  const {currentUser} = useAuth();
  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const [messageSending, setMessageSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [messageLog, setMessageLog] = useState(/** @type [SMSLogData]*/[]);
  const [failureCount, setFailureCount] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [sendToAll, setSendToAll] = useState(true);
  const [sendTo, setSendTo] = useState([]);

  const formData = useFormData();

  useEffect(() => {
    if (formData && !formData.edits.SMSCampaignID) {
      formData.edits.SMSCampaignID = campaign.SMSCampaignID;
    }
    if (formData && !formData.edits.UserID && currentUser?.UserID) {
      formData.edits.UserID = currentUser?.UserID;
    }
  }, [formData, currentUser, campaign.SMSCampaignID]);

  function isDataValid() {
    return formData?.edits.Title?.length > 0 && formData.edits.Message?.length > 0 && formData.edits.Message?.match(/[.?!]$/);
  }

  function sendMessage() {
    setMessageSending(true);
    if (sendToAll) {
      SMS.sendSmsMessage(formData.edits).then((result) => {
        setMessageSent(true);
        setMessageSending(false);
        setMessageLog(JSON.parse(result.Log));
      }).catch((err) => {
        showErrorAlert(err);
        setMessageSending(false);
      });
    } else {
      SMS.insertOrUpdateSmsMessage(formData.edits).then((result) => {
        formData.update(result);
        SMS.resendSmsMessage({
          SMSCampaignID: campaign.SMSCampaignID,
          SMSMessageID: result.SMSMessageID,
          Subscribers: sendTo,
        }).then((result) => {
          setMessageSent(true);
          setMessageSending(false);
          setMessageLog(result);
        }).catch((err) => {
          showErrorAlert(err);
          setMessageSending(false);
        });
      }).catch((err) => {
        showErrorAlert(err);
        setMessageSending(false);
      });
    }
  }

  useEffect(() => {
    if (messageLog) {
      let successCount = 0;
      let failureCount = 0;
      for (const logEntry of messageLog) {
        if (logEntry.Error) {
          failureCount++;
        } else {
          successCount++;
        }
      }
      setSuccessCount(successCount);
      setFailureCount(failureCount);
    } else {
      setSuccessCount(0);
      setFailureCount(0);
    }
  }, [messageLog]);

  function handleSubscriberChecked(subscriber, checked) {
    if (checked && !sendTo.includes(subscriber.SubscriberID)) {
      setSendTo([...sendTo, subscriber.SubscriberID]);
    } else if (!checked && sendTo.includes(subscriber.SubscriberID)) {
      setSendTo(sendTo.filter((id)=>id!==subscriber.SubscriberID));
    }
  }

  function handleAllSubscribersChecked(subscribers) {
    setSendTo(subscribers.map((subscriber) => subscriber.SubscriberID));
  }

  return <>
    {campaign && <div className={'SendSmsMessagePanel'}>
      {messageSent ?
        <>
          <Row className={'mt-2'}><Col><p>Your message was sent to {successCount} subscriber(s). {failureCount} error(s)
            occurred.</p></Col></Row>
          {showLog && <Row className={'mt-2'}>
            <Col>
              {messageLog.map((logEntry) => {
                return <div key={logEntry.SMSLogID}
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
                value={formData?.edits.Title || ''}
                isValid={formData?.isTouched('Title') && formData.edits.Title?.length > 0}
                isInvalid={formData?.isTouched('Title') && !(formData.edits.Title?.length > 0)}
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
                value={formData?.edits.Message || ''}
                isValid={formData?.isTouched('Message') && formData.edits.Message?.length > 0 && formData.edits.Message?.match(/[.?!]$/)}
                isInvalid={formData?.isTouched('Message') && (!(formData.edits.Message?.length > 0) || !formData.edits.Message?.match(/[.?!]$/))}
                onChange={(e) => formData.onDataChanged({name: 'Message', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row><Col className={"small text-secondary"}>End your message with punctuation (.?!) to ensure
            readability.</Col></Row>
          <SmsMessagePreview campaign={campaign} message={formData?.edits}/>
          <Row className={'mt-2'}>
            <Col className={'d-flex'}>
              <Form.Label
                xxl={2}
                column={'sm'}
                htmlFor={'SendToAll'}
                className={'me-4'}
              >
                Send to:
              </Form.Label>
              <Form.Check
                type='radio'
                name={'SendToAll'}
                checked={sendToAll}
                onChange={() => setSendToAll(!sendToAll)}
                label={"All subscribers"}
                inline
              />
              <Form.Check
                type='radio'
                name={'SendToAll'}
                checked={!sendToAll}
                onChange={() => setSendToAll(!sendToAll)}
                label={"Selected subscribers"}
                inline
              />
            </Col>
          </Row>
          <div hidden={sendToAll} className={'SmsSubscriberList'}>
            <SmsSubscriberList campaign={campaign} onItemChecked={handleSubscriberChecked}
                               onAllItemsChecked={handleAllSubscribersChecked} showFilter={true}/>
          </div>
          <Row className={'mt-3'}>
            <Col>
              <Button
                disabled={!isDataValid() || messageSending}
                onClick={sendMessage}
                style={{width: '200px'}}
              >
                {messageSending ? <Spinner animation="border" size="sm"/> : <span>{sendToAll ? <>Send Message</> : <>Send to {sendTo.length} Subscriber{sendTo.length !== 1 && <>s</>}</>}</span>}
              </Button>
            </Col>
          </Row>
        </>
      }
    </div>}
  </>
}