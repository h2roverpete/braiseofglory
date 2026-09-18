import {TabPane, Tabs} from "react-bootstrap";
import {useAuth} from "../../auth/AuthProvider";
import {Resource, Permission} from "../../auth/Permissions";
import {useEffect, useMemo, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import SmsSubscriberList from "./SmsSubscriberList";
import SmsMessageList from "./SmsMessageList";
import SmsMessagePanel from "./SmsMessagePanel";
import FormEditor from "../editor/FormEditor";
import SendSmsMessagePanel from "./SendSmsMessagePanel";
import SmsLogEntryList from "./SmsLogEntryList";
import './SmsAdminPage.css'
import {BsXLg} from "react-icons/bs";
import SmsCampaignConfig from "./SmsCampaignConfig";
import './SmsCampaignPanel.css';

export default function SmsCampaignPanel({campaignId, campaignData}) {

  const [campaign, setCampaign] = useState(/** @type {SMSCampaignData} */ campaignData);
  const [message, setMessage] = useState(/** @type {SMSMessageData} */ null);
  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  const {hasPermission} = useAuth();
  const hasSendPermission = useMemo(() => hasPermission(Resource.SMS, Permission.SEND), [hasPermission]);
  const hasAdminPermission = useMemo(() => hasPermission(Resource.SMS, Permission.ADMIN), [hasPermission]);

  useEffect(() => {
    if (campaignData && !campaign) {
      setCampaign(campaignData);
    } else if (campaignId && !campaign) {
      SMS.getSmsCampaign(campaignId).then((result) => {
        setCampaign(result);
      }).catch((err) => {
        showErrorAlert(err);
      })
    }
  }, [SMS, campaignId, campaign, campaignData, showErrorAlert]);

  function handleDeleteMessage(msg) {
    SMS.deleteSmsMessage(msg.SMSCampaignID, msg.SMSMessageID).then((result) => {
      setMessage(null);
    }).catch((err) => {
      showErrorAlert(err)
      setMessage(null);
    });
  }

  return <>{campaign && hasSendPermission &&
    <div className={'Editor CampaignTabPanel'}>
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
                <SendSmsMessagePanel campaign={campaign}/>
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
            <SmsSubscriberList
              campaign={campaign}
              canAddSubscribers={hasAdminPermission}
              canEditSubscribers={hasAdminPermission}
              showFilter={true}
            />
          </div>
        </TabPane>
        {hasSendPermission &&
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
                       style={{height: '100%', overflowY: 'auto', overflowX: 'clip'}}
                  >
                    <SmsMessagePanel
                      campaign={campaign}
                      message={message}
                      onDelete={handleDeleteMessage}
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
        }
        {hasAdminPermission &&
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
        }
        {hasAdminPermission &&
          <TabPane
            title={'Config'}
            eventKey={"config"}
            className="p-3 border border-light-subtle border-top-0"
            style={{height: '100%', overflowY: 'auto', overflowX: 'clip'}}
          >
            <div className={'TabPaneContents'}>
              <h4>{campaign.CampaignName} Config</h4>
              <div className={'ScrollY'}>
                <SmsCampaignConfig campaign={campaign}/>
              </div>
            </div>
          </TabPane>
        }
      </Tabs>
    </div>
  }</>
}