import {useEffect, useRef, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {Button, Spinner} from "react-bootstrap";
import SmsMessagePreview from "./SmsMessagePreview";
import SmsLogEntryList from "./SmsLogEntryList";

export default function SmsMessagePanel({campaign, message}) {

  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  const [selectedSubscribers, setSelectedSubscribers] = useState(/** @type {[Number]} */ []);
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState(/** @type MMSFileData[] */ []);

  const listApi = useRef(/** @type ListAPI */ null);

  useEffect(() => {
    SMS.getMmsFiles(message.SMSCampaignID, message.SMSMessageID).then((result) => {
      setFiles(result);
    }).catch((err) => showErrorAlert(err));
  }, [message, SMS, setFiles])

  function resendMessage() {
    if (selectedSubscribers.length > 0) {
      setSending(true);
      SMS.resendSmsMessage({
        SMSCampaignID: message.SMSCampaignID,
        SMSMessageID: message.SMSMessageID,
        Subscribers: selectedSubscribers,
      }).then((result) => {
        listApi.current.addListItems(result);
        setSelectedSubscribers([]);
        setSending(false);
      }).catch((error) => {
        showErrorAlert(error);
        setSending(false);
      })
    }
  }

  function handleItemChecked(item, checked) {
    if (checked && !selectedSubscribers.includes(item.SubscriberID)) {
      setSelectedSubscribers([...selectedSubscribers, item.SubscriberID]);
    } else if (!checked && selectedSubscribers.includes(item.SubscriberID)) {
      setSelectedSubscribers(selectedSubscribers.filter((n) => n !== item.SubscriberID));
    }
  }

  function handleAllItemsChecked(checked) {
    if (checked) {
      let allSubscribers = [];
      for (const subscriber of listApi.current.getListItems()) {
        allSubscribers.push(subscriber.SubscriberID);
      }
      setSelectedSubscribers(allSubscribers);
    } else {
      setSelectedSubscribers([]);
    }
  }

  return <>{message &&
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden'}}>
      <div className={'mb-4'}>
        <SmsMessagePreview message={message} campaign={campaign} files={files}/>
      </div>
      <SmsLogEntryList
        campaign={campaign}
        message={message}
        onItemChecked={handleItemChecked}
        onAllItemsChecked={handleAllItemsChecked}
        apiRef={listApi}
      />
      <div className={"mt-4"}>
        <Button
          variant={'primary'}
          disabled={selectedSubscribers.length === 0 || sending}
          onClick={resendMessage}
          style={{width: '300px'}}
        >
          {sending ?
            <Spinner size={"sm"}/>
            :
            <>Resend to {selectedSubscribers.length} Subscriber{selectedSubscribers.length !== 1 && 's'}</>
          }
        </Button>
      </div>
    </div>}</>;
}