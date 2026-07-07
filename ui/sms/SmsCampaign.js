import FormEditor from "../editor/FormEditor";
import SmsCampaignPanel from "./SmsCampaignPanel";

/**
 * Display UI for SMS Campaign, add a user's mobile number
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsCampaign({smsCampaignId}) {
    return <FormEditor>
      <SmsCampaignPanel smsCampaignId={smsCampaignId} />
    </FormEditor>
}