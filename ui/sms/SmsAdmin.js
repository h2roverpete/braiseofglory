import {useAuth} from "../../auth/AuthProvider";
import {useEffect} from "react";
import {Resource, Permission} from "../../auth/Permissions";
import {useRestApi} from "../../api/RestApi";
import {useState} from "react";
import {Container} from "react-bootstrap";
import SendSmsMessage from "./SendSmsMessage";

export default function SmsAdmin(props) {

  const [canSendSms, setCanSendSms] = useState(false);
  const [canAdminSms, setCanAdminSms] = useState(false);
  const [smsCampaigns, setSmsCampaigns] = useState([]);
  const {hasPermission} = useAuth();
  const {SMS} = useRestApi();

  useEffect(() => {
    const admin = hasPermission(Resource.SMS, Permission.ADMIN);
    setCanAdminSms(admin);
    const send = hasPermission(Resource.SMS, Permission.SEND);
    setCanSendSms(send);
  }, [setCanSendSms, setCanAdminSms]);

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
  }, [setSmsCampaigns]);

  return <Container>
    {smsCampaigns.map((campaign) => {
      return <span key={campaign.SMSCampaignID}>
        <SendSmsMessage smsCampaign={campaign}/>
      </span>
    })}
  </Container>
}