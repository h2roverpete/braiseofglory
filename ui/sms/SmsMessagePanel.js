import {useCallback, useEffect, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {Table, Form, Button, Spinner} from "react-bootstrap";
import {BsSortDown, BsSortUp} from "react-icons/bs";
import SmsMessagePreview from "./SmsMessagePreview";

export default function SmsMessagePanel({campaign, message}) {

  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  const [selectedSubscribers, setSelectedSubscribers] = useState(/** @type {[Number]} */ []);
  const [sending, setSending] = useState(false);

  const [listItems, setListItems] = useState(/** @type {[SMSLogData]} */ null);

  useEffect(() => {
    if (message && !listItems) {
      SMS.getSmsMessageLog(message.SMSCampaignID, message.SMSMessageID).then((result) => {
        setListItems(result.sort(sortFunction));
      }).catch((error) => {
        showErrorAlert(error);
      })
    }
  }, [message, listItems, setListItems]);

  function toggleSubscriber(event, id) {
    event.target.checked = !event.target.checked;
    if (!selectedSubscribers.includes(id)) {
      setSelectedSubscribers([...selectedSubscribers, id]);
    } else {
      setSelectedSubscribers(selectedSubscribers.filter((n) => n !== id));
    }
  }

  function resendMessage() {
    if (selectedSubscribers.length > 0) {
      setSending(true);
      SMS.resendSmsMessage({
        SMSCampaignID: message.SMSCampaignID,
        SMSMessageID: message.SMSMessageID,
        Subscribers: selectedSubscribers,
      }).then((result) => {
        const newList = [...listItems, ...result];
        setListItems(newList);
        setSending(false);
      }).catch((error) => {
        showErrorAlert(error);
        setSending(false);
      })
    }
  }

  const [sortKey, setSortKey] = useState('Created');
  const [sortAscending, setSortAscending] = useState(false);

  const sortFunction = useCallback((a, b) => {
    switch (typeof a[sortKey]) {
      case 'number':
        return sortAscending ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
      case 'string':
        return sortAscending ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
      default:
        return 0;
    }
  }, [sortKey, sortAscending]);

  function arraysAreEqual(a, b) {
    return a && b && a.length === b.length && a.every((v, i) => v === b[i]);
  }

  useEffect(() => {
    if (listItems) {
      const sorted = listItems.toSorted(sortFunction);
      if (!arraysAreEqual(listItems, sorted)) {
        setListItems(sorted);
      }
    }
  }, [setListItems, listItems, sortKey, sortAscending, sortFunction]);


  function sortBy(key) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortAscending(true);
    } else {
      setSortAscending(!sortAscending);
    }
  }

  return <>{message && <>
    <SmsMessagePreview message={message} campaign={campaign} />
    {listItems && <div className={'mt-4'}>
      <h5>Message Log</h5>
      <Table
        hover
        responsive
        style={{
          height: 'auto',
          flexGrow: 1,
          overflowY: 'scroll'
        }}
      >
        <thead style={{position: 'sticky', top: 0,}}>
        <tr>
          <th></th>
          <th
            className={'text-nowrap'}
            role={'button'}
            onClick={() => sortBy('Subscriber')}
          >
            Subscriber
            {sortKey === 'Subscriber' &&
              <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
            }
          </th>
          <th
            className={'text-nowrap'}
            role={'button'}
            onClick={() => sortBy('Error')}
          >
            Result
            {sortKey === 'Error' &&
              <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
            }
          </th>
          <th
            className={'text-nowrap'}
            role={'button'}
            onClick={() => sortBy('Created')}
          >
            Sent
            {sortKey === 'Created' &&
              <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
            }
          </th>
        </tr>
        </thead>
        <tbody>
        {listItems.map((listItem) =>
          <tr key={listItem.SMSLogID}>
            <td><Form.Check
              role={"button"}
              checked={selectedSubscribers.includes(listItem.SubscriberID)}
              onChange={e => toggleSubscriber(e, listItem.SubscriberID)}
            /></td>
            <td>{listItem.Subscriber}</td>
            <td
              className={listItem.Error ? 'text-danger' : 'text-success'}>{listItem.Error ? listItem.Error : 'Sent'}</td>
            <td className={'text-nowrap'}>{Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            }).format(Date.parse(listItem.Created))}</td>
          </tr>
        )}
        </tbody>
      </Table>
      <div className={"mt-2"}>
        <Button
          variant={'primary'}
          disabled={selectedSubscribers.length === 0 || sending}
          onClick={resendMessage}
          style={{width:'200px'}}
        >
          {sending ?
            <Spinner size={"sm"}/>
            :
            <>Resend to {selectedSubscribers.length} Subscriber{selectedSubscribers.length !== 1 && 's'}</>
          }
        </Button>
      </div>
    </div>}
  </>}</>;
}