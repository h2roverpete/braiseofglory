import './TextMessagePreview.css'

/**
 * Display a <div> containing a message preview.
 *
 * @param {SMSCampaignData} campaign
 * @param {SMSMessageData} message
 * @constructor
 */
export default function TextMessagePreview({campaign, text}) {
  const smsSuffix = `Reply STOP to unsubscribe.`;

  return <>{
    <div className={'bubble-bottom-right'}>
      {campaign && <>[{campaign.CampaignName}] </>}
      <span
        className={'text-light'}
        dangerouslySetInnerHTML={{__html: text?.replaceAll('\n', '<br/>')}}
      />
      {smsSuffix}
    </div>
  }</>;
}