import {useCallback, useEffect, useState} from "react";
import {Table, Form} from "react-bootstrap";
import {BsSortDown, BsSortUp} from "react-icons/bs";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import SmsLogEntryModal from "./SmsLogEntryModal";

/**
 * @typedef ListAPI
 *
 * @property {function([SMSLogData])} addListItems
 */
/**
 *
 * @param {SMSCampaignData} campaign
 * @param {SMSMessageData | null} [message]
 * @param {function(SMSLogData, Boolean)} [onItemChecked]   Callback when a list item is checked or unchecked
 * @param {RefObject<function(ListAPI)>} [apiRef]                 API for accessing list.
 * @constructor
 */
export default function SmsLogEntryList({campaign, message, onItemChecked, apiRef}) {

  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  const [listItems, setListItems] = useState(/** @type {[SMSLogData]} */ null);
  const [editItem, setEditItem] = useState( /** @type {SMSLogData} */ null);
  useEffect(() => {
    if (campaign && message && !listItems) {
      SMS.getSmsMessageLog(campaign.SMSCampaignID, message.SMSMessageID).then((result) => {
        setListItems(result.sort(sortFunction));
      }).catch((error) => {
        showErrorAlert(error);
      })
    } else if (campaign && !listItems) {
      SMS.getSmsCampaignLog(campaign.SMSCampaignID).then((result) => {
        setListItems(result.sort(sortFunction));
      }).catch((error) => {
        showErrorAlert(error);
      })
    }
  }, [message, listItems, setListItems]);

  const handleAddItems = useCallback((items) => {
    setListItems([...listItems, ...items].sort(sortFunction));
  }, []);

  if (apiRef) {
    apiRef.current = {
      addListItems: handleAddItems
    }
  }

  const [sortKey, setSortKey] = useState('Created');
  const [sortAscending, setSortAscending] = useState(false);

  const sortFunction = useCallback((a, b) => {
    if (a[sortKey] !== undefined && b[sortKey] !== undefined) {
      switch (typeof a[sortKey]) {
        case 'number':
          return sortAscending ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
        case 'string':
          return sortAscending ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
        default:
          return 0;
      }
    } else if (a[sortKey] === undefined && b[sortKey] !== undefined) {
      return sortAscending ? 1 : -1;
    } else if (a[sortKey] !== undefined && b[sortKey] === undefined) {
      return sortAscending ? -1 : 1;
    } else {
      return 0
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

  return <>{listItems?.length > 0 && <>
    <Table
      hover
      responsive
      style={{
        height: '100%',
        overflowY: 'scroll'
      }}
    >
      <thead style={{position: 'sticky', top: 0,}}>
      <tr>
        {onItemChecked && <th></th>}
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('SMSLogID')}
        >
          ID
          {sortKey === 'SMSLogID' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('Created')}
        >
          Timestamp
          {sortKey === 'Created' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('Action')}
        >
          Action
          {sortKey === 'Action' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
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
          onClick={() => sortBy('UserID')}
        >
          User
          {sortKey === 'UserID' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('SMSMessageID')}
        >
          Message
          {sortKey === 'SMSMessageID' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
      </tr>
      </thead>
      <tbody>
      {listItems.map((listItem) =>
        <tr
          key={listItem.SMSLogID}
          onClick={() => setEditItem(listItem)}
          role={'button'}
        >
          {onItemChecked && <td onClick={(e) => {
            e.stopPropagation()
          }}>
            <Form.Check
              onChange={(e) => {
                onItemChecked(listItem, e.target.checked);
              }}
            />
          </td>}
          <td>{listItem.SMSLogID}</td>
          <td className={'text-nowrap'}>{Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          }).format(Date.parse(listItem.Created))}</td>
          <td>{listItem.Action}</td>
          <td>{listItem.Subscriber}</td>
          <td
            className={listItem.Error ? 'text-danger' : 'text-success'}>{listItem.Error ? listItem.Error : 'Sent'}</td>
          <td>{listItem.UserID}</td>
          <td>{listItem.SMSMessageID}</td>
        </tr>
      )}
      </tbody>
    </Table>
    <SmsLogEntryModal show={editItem} campaign={campaign} logEntry={editItem} onHide={() => setEditItem(null)}/>
  </>}
  </>
}