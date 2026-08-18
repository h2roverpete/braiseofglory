import './TextMessagePreview.css'

/**
 * Display a <div> containing a message preview.
 *
 * @param {SMSCampaignData} campaign
 * @param {SMSMessageData} message
 * @constructor
 */
export default function TextMessagePreview({campaign, text}) {
  return <>{
    <div className={'bubble-bottom-right'}>
      <div className={'bubble-content'}>
        {campaign && <>[{campaign.CampaignName}] </>}
        <span
          className={'text-light'}
          dangerouslySetInnerHTML={{__html: text?.replaceAll('\n', '<br/>')}}
        />
      </div>
    </div>
  }</>;
}