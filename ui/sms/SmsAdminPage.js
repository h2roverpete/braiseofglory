import {useLocation} from "react-router";
import {useEffect, useState} from "react";
import SmsCampaignPanel from "./SmsCampaignPanel";
import {Container} from "react-bootstrap";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";

export default function SmsAdminPage() {

  const location = useLocation();
  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  const [campaignId, setCampaignId] = useState(0);
  const [campaign, setCampaign] = useState(/** @type {SMSCampaignData} */ null);

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.has('campaignId')) {
      setCampaignId(parseInt(params.get('campaignId')));
    }
  }, [location, setCampaignId]);

  useEffect(() => {
    if (campaignId && !campaign) {
      SMS.getSmsCampaign(campaignId).then((data) => {
        setCampaign(data);
      }).catch((err) => {
        showErrorAlert(err);
      })
    }
  }, [campaignId, setCampaign, SMS, showErrorAlert, campaign]);

  return <Container
    fluid
    className="PageContent"
  >
    <div className="SmsAdmin">
      {campaign && <h1 className={"PageTitle"}>{campaign.CampaignName} Administration</h1>}
      <SmsCampaignPanel campaignId={campaignId}/>
    </div>
  </Container>

}