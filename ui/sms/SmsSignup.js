import FormEditor from "../editor/FormEditor";
import SmsSignupFields from "./SmsSignupFields";

/**
 * Display UI for SMS Campaign, add a user's mobile number
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsSignup({smsCampaignId}) {
    return <FormEditor>
      <SmsSignupFields smsCampaignId={smsCampaignId} />
    </FormEditor>
}