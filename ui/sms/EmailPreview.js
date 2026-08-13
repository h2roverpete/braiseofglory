import './EmailPreview.css';

/**
 * Display a <div> containing a message preview.
 *
 * @param {SMSCampaignData} campaign
 * @param {SMSMessageData} message
 * @param {SMSSubscriberData} subscriber
 * @constructor
 */
export default function EmailPreview({campaign, message, subscriber}) {
  return <div className={'email-preview'}>
    <div><strong>To: {subscriber ? <>{subscriber.SubscriberName} &lt;{subscriber.SubscriberEmail}&gt;</> : <>Subscriber &lt;subscriber@whatever.com&gt;</>}</strong></div>
    <div className={'mt-2'}><strong>From: {campaign.CampaignName} &lt;{campaign.CampaignEmail}&gt;</strong>
    </div>
    <div className={'mt-2'}><strong>Subject: [{campaign.CampaignName}] {message.Title}</strong></div>
    <div className={'mt-2'} dangerouslySetInnerHTML={{__html: message.Message?.replaceAll('\n', '<br/>')}}></div>
    <div className={'mt-2'}>You are receiving this email because you opted in to
      receive {campaign.CampaignName} notifications. <span
        className={'text-decoration-underline text-dark'}>Click here to unsubscribe.</span>
    </div>
  </div>;
}