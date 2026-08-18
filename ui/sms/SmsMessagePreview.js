import {Col, Row} from "react-bootstrap";
import TextMessagePreview from "./TextMessagePreview";
import EmailPreview from "./EmailPreview";

/**
 * Display a <div> containing a message preview.
 *
 * @param {SMSCampaignData} campaign
 * @param {SMSMessageData} message
 * @constructor
 */
export default function SmsMessagePreview({campaign, message}) {
  return <>{campaign && message && <Row>
    <Col sm={6} className={'mt-3'}>
      <h5>SMS</h5>
      <TextMessagePreview text={message.Message + ' Reply STOP to unsubscribe.'} campaign={campaign}/>
    </Col>
    <Col sm={6} className={'mt-3 d-flex flex-column'}>
      <h5>Email</h5>
      <EmailPreview message={message} campaign={campaign}/>
    </Col>
  </Row>}</>;
}