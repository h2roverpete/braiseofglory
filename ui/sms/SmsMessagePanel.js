import {useEffect, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {Table, Form, Button} from "react-bootstrap";
import {BsSortDown, BsSortUp} from "react-icons/bs";

export default function SmsMessagePanel({campaignId, messageId}) {

  const [message, setMessage] = useState(/** @type{SMSMessageData} */ null);
  const [listItems, setListItems] = useState(/** @type{SMSLogData} */ null);
  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const [selectedSubscribers, setSelectedSubscribers] = useState(/** @type {[Number]} */ []);

  useEffect(() => {
    if (campaignId && messageId && !message) {
      SMS.getSmsMessage(campaignId, messageId).then((result) => {
        setMessage(result);
      }).catch((error) => {
        showErrorAlert(error);
      })
    }
  }, [SMS, messageId, message, setMessage]);

  useEffect(() => {
    if (campaignId && messageId && !listItems) {
      SMS.getSmsLog(campaignId, messageId).then((result) => {
        setListItems(result);
      }).catch((error) => {
        showErrorAlert(error);
      })
    }
  })

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
      SMS.resendSmsMessage({
        SMSCampaignID: campaignId,
        SMSMessageID: messageId,
        Subscribers: selectedSubscribers,
      }).then((result) => {
        setListItems([...listItems, result]);
      }).catch((error) => {
        showErrorAlert(error);
      })
    }
  }

  const [sortKey, setSortKey] = useState('Created');
  const [sortAscending, setSortAscending] = useState(false);

  function sortFunction(a, b) {
    switch (typeof a[sortKey]) {
      case 'number':
        return sortAscending ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
      case 'string':
        return sortAscending ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
      default:
        return 0;
    }
  }

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
    <h5>{message.Title}</h5>
    <p>{message.Message}</p>
    {listItems && <>
      <h5>Recipients</h5>
      <Table responsive>
        <thead>
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
        {listItems.map((log) =>
          <tr key={log.SMSLogID}>
            <td><Form.Check
              role={"button"}
              checked={selectedSubscribers.includes(log.SubscriberID)}
              onChange={e => toggleSubscriber(e, log.SubscriberID)}
            /></td>
            <td>{log.Subscriber}</td>
            <td className={log.Error ? 'text-danger' : 'text-success'}>{log.Error ? log.Error : 'Sent'}</td>
            <td className={'text-nowrap'}>{Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            }).format(Date.parse(log.Created))}</td>
          </tr>
        )}
        </tbody>
      </Table>
      <div className={"mt-2"}>
        <Button
          variant={'primary'}
          disabled={selectedSubscribers.length === 0}
          onClick={resendMessage}
        >
          Resend to {selectedSubscribers.length} Subscriber{selectedSubscribers.length!==1&&'s'}
        </Button>
      </div>
    </>}
  </>}</>;
}