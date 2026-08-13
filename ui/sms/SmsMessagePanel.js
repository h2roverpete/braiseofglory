import {useRef, useState} from "react";
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

  const listApi = useRef(/** @type ListAPI */ null);

  function resendMessage() {
    if (selectedSubscribers.length > 0) {
      setSending(true);
      SMS.resendSmsMessage({
        SMSCampaignID: message.SMSCampaignID,
        SMSMessageID: message.SMSMessageID,
        Subscribers: selectedSubscribers,
      }).then((result) => {
        listApi.current.addListItems(result);
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

  return <>{message && <>
    <SmsMessagePreview message={message} campaign={campaign} />
    <h5>Log</h5>
    <SmsLogEntryList campaign={campaign} message={message} onItemChecked={handleItemChecked} apiRef={listApi} />
    <div className={"mt-2"}>
      <Button
        variant={'primary'}
        disabled={selectedSubscribers.length === 0 || sending}
        onClick={resendMessage}
        style={{width:'300px'}}
      >
        {sending ?
          <Spinner size={"sm"}/>
          :
          <>Resend to {selectedSubscribers.length} Subscriber{selectedSubscribers.length !== 1 && 's'}</>
        }
      </Button>
    </div>
  </>}</>;
}