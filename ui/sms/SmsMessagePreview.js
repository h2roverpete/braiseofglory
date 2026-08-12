import {Col, Row} from "react-bootstrap";

/**
 * Display a <div> containing a message preview.
 *
 * @param {SMSCampaignData} campaign
 * @param {SMSMessageData} message
 * @constructor
 */
export default function SmsMessagePreview({campaign, message}) {
  const smsSuffix = `Reply STOP to unsubscribe.`;

  return <>{campaign && message && <Row>
    <Col sm={6} className={'mt-3'}>
      <h5>SMS</h5>
      <div style={{padding: '15px', marginRight: '10px', backgroundColor: '#606060'}}
           className={'small text-light rounded-3 position-relative bubble-bottom-right'}>
        {campaign.CampaignName}: <span className={'text-light'}
                                       dangerouslySetInnerHTML={{__html: message.Message?.replaceAll('\n', '<br/>')}}></span> {smsSuffix}
      </div>
    </Col>
    <Col sm={6} className={'mt-3'}>
      <h5>Email</h5>
      <div style={{backgroundColor: '#dddddd', padding: '15px'}} className={'small text-black'}>
        <div><strong>To: Subscriber &lt;subscriber@whatever.com&gt;</strong></div>
        <div className={'mt-2'}><strong>From: {campaign.CampaignName} &lt;{campaign.CampaignEmail}&gt;</strong>
        </div>
        <div className={'mt-2'}><strong>Subject: [{campaign.CampaignName}] {message.Title}</strong></div>
        <div className={'mt-2'} dangerouslySetInnerHTML={{__html: message.Message?.replaceAll('\n', '<br/>')}}></div>
        <div className={'mt-2'}>You are receiving this email because you opted in to
          receive {campaign.CampaignName} notifications. <span
            className={'text-decoration-underline text-dark'}>Click here to unsubscribe.</span>
        </div>
      </div>
    </Col>
  </Row>}</>;
}