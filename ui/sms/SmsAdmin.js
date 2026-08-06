import {useEffect} from "react";
import {useRestApi} from "../../api/RestApi";
import {useState} from "react";
import {Container} from "react-bootstrap";
import SendSmsMessage from "./SendSmsMessage";

export default function SmsAdmin(props) {

  const [smsCampaigns, setSmsCampaigns] = useState([]);
  const {SMS} = useRestApi();

  useEffect(() => {
    SMS.getSmsCampaigns().then((response) => {
      let campaigns = [];
      for (const campaign of response) {
        if (campaign.SiteID === parseInt(process.env.REACT_APP_SITE_ID)) {
          campaigns.push(campaign);
        }
      }
      setSmsCampaigns(campaigns);
    }).catch((err) => {
      console.error(err);
    })
  }, [setSmsCampaigns, SMS]);

  return <Container>
    {smsCampaigns.map((campaign) => {
      return <span key={campaign.SMSCampaignID}>
        <SendSmsMessage smsCampaign={campaign}/>
      </span>
    })}
  </Container>
}