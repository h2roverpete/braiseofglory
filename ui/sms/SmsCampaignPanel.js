import {Row, TabPane, Tabs} from "react-bootstrap";
import {useAuth} from "../../auth/AuthProvider";
import {Resource, Permission} from "../../auth/Permissions";
import {useEffect, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import SmsCampaignFields from "./SmsCampaignFields";
import SmsSubscriberList from "./SmsSubscriberList";
import SmsMessageList from "./SmsMessageList";
import SmsMessagePanel from "./SmsMessagePanel";
import FormEditor from "../editor/FormEditor";
import SendSmsMessageFields from "./SendSmsMessageFields";
import SmsLogEntryList from "./SmsLogEntryList";
import './SmsAdminPage.css'
import {BsXLg} from "react-icons/bs";

export default function SmsCampaignPanel({campaignId, campaignData}) {

  const {hasPermission} = useAuth();
  const [hasSendPermission, setHasSendPermission] = useState(false);
  const [hasAdminPermission, setHasAdminPermission] = useState(false);
  const [campaign, setCampaign] = useState(/** @type {SMSCampaignData} */ campaignData);
  const [message, setMessage] = useState(/** @type {SMSMessageData} */ null);
  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  useEffect(() => {
    setHasSendPermission(() => hasPermission(Resource.SMS, Permission.SEND));
  }, [hasPermission, setHasSendPermission]);

  useEffect(() => {
    setHasAdminPermission(() => hasPermission(Resource.SMS, Permission.ADMIN));
  }, [hasPermission, setHasAdminPermission]);

  useEffect(() => {
    if (campaignId && !campaign) {
      SMS.getSmsCampaign(campaignId).then((result) => {
        setCampaign(result);
      }).catch((err) => {
        showErrorAlert(err);
      })
    }
  }, [campaignId, campaign, showErrorAlert]);

  return <>{campaign && <div
    className={'Editor CampaignTabPanel'}
  >
    {hasAdminPermission ?
      <Tabs
        defaultActiveKey={"send"}
        className="mt-2"
      >
        <TabPane
          title={'Send'}
          eventKey={"send"}
          className="p-3 border border-top-0"
        >
          <div className={'TabPaneContents'}>
            <h4>Send a Message to {campaign.CampaignName} Subscribers</h4>
            <div className={'ScrollY'}>
              <FormEditor>
                <SendSmsMessageFields campaign={campaign}/>
              </FormEditor>
            </div>
          </div>
        </TabPane>
        <TabPane
          title={'Subscribers'}
          eventKey={"subscribers"}
          className="p-3 border border-top-0"
        >
          <div className={'TabPaneContents'}>
            <h4>{campaign.CampaignName} Subscribers</h4>
            <SmsSubscriberList campaign={campaign}/>
          </div>
        </TabPane>
        <TabPane
          title={'Messages'}
          eventKey={"messages"}
          className="p-3 border border-top-0"
        >
          <div className={'TabPaneContents'}>
            {message ? <>
                <BsXLg
                  role={'button'}
                  size={20}
                  onClick={() => setMessage(null)}
                  style={{position: "absolute", top: 0, right: 0}}
                />
                <h4>Message: {message.Title}</h4>
                <div className={'position-relative'}
                     style={{height: '100%', overflowY: 'scroll', overflowX: 'clip'}}
                >
                  <SmsMessagePanel
                    campaign={campaign}
                    message={message}
                  />
                </div>
              </>
              : <>
                <h4>{campaign.CampaignName} Messages</h4>
                <SmsMessageList
                  campaign={campaign}
                  onViewMessage={(message) => setMessage(message)}
                />
              </>
            }
          </div>
        </TabPane>
        <TabPane
          title={'Log'}
          eventKey={"log"}
          className="p-3 border border-light-subtle border-top-0"
        >
          <div className={'TabPaneContents'}>
            <h4>{campaign.CampaignName} Log</h4>
            <FormEditor>
              <SmsLogEntryList campaign={campaign}/>
            </FormEditor>
          </div>
        </TabPane>
        <TabPane
          title={'Config'}
          eventKey={"config"}
          className="p-3 border border-light-subtle border-top-0"
          style={{height: '100%', overflowY: 'scroll', overflowX: 'clip'}}
        >
          <div className={'TabPaneContents'}>
            <h4>{campaign.CampaignName} Config</h4>
            <div className={'ScrollY'}>
              <FormEditor>
                <SmsCampaignFields campaign={campaign}/>
              </FormEditor>
            </div>
          </div>
        </TabPane>
      </Tabs>
      :
      <> {hasSendPermission &&
        <Row>
          <h4>Send a Message to {campaign.CampaignName} Subscribers</h4>
          <FormEditor>
            <SendSmsMessageFields campaign={campaign}/>
          </FormEditor>
        </Row>
      }
      </>
    }
  </div>
  }
  </>
}