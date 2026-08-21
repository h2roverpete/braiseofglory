import {useCallback, useEffect, useState} from "react";
import {Table, Form} from "react-bootstrap";
import {BsSortDown, BsSortUp} from "react-icons/bs";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import SmsSubscriberModal from "./SmsSubscriberModal";
import FormEditor from "../editor/FormEditor";

/**
 * @typedef ListAPI<T>
 *
 * @property {function([T])} addListItems
 * @property {function(): [T]} getListItems
 * @property {function(): [T]} getCheckedItems
 */

/**
 *
 * @param {SMSCampaignData} campaign
 * @param {function(SMSSubscriberData, Boolean)} [onItemChecked]         Callback when a list item is checked or unchecked
 * @param {function([SMSSubscriberData], Boolean)} [onAllItemsChecked]                       Callback for check all / uncheck all items.
 * @param {RefObject<function(ListAPI<SMSSubscriberData>)>} [apiRef]      API for accessing list.
 * @constructor
 */
export default function SmsSubscriberList({campaign, onItemChecked, onAllItemsChecked, apiRef}) {

  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  const [listItems, setListItems] = useState(/** @type {[SMSSubscriberData]} */ null);
  const [editItem, setEditItem] = useState( /** @type {SMSSubscriberData} */ null);
  const [checkedItems, setCheckedItems] = useState( /** @type {[SMSSubscriberData]} */ []);

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

  useEffect(() => {
    if (campaign && !listItems) {
      SMS.getSmsCampaignSubscribers(campaign.SMSCampaignID).then((result) => {
        setListItems(result.sort(sortFunction));
      }).catch((error) => {
        showErrorAlert(error);
      })
    }
  }, [SMS, campaign, showErrorAlert, listItems, setListItems, sortFunction]);

  /**
   * @type {(function([SMSSubscriberData]): void)|*}
   */
  const handleAddItems = useCallback((items) => {
    setListItems([...listItems, ...items].sort(sortFunction));
  }, [listItems, sortFunction, setListItems]);

  if (apiRef) {
    apiRef.current = {
      addListItems: handleAddItems,
      getListItems: () => listItems,
      getCheckedItems: () => checkedItems,
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

  function handleItemChecked(item, checked) {
    if (checked && !checkedItems.includes(checked)) {
      setCheckedItems([...checkedItems, item]);
    } else if (!checked && checkedItems.includes(item)) {
      setCheckedItems(checkedItems.filter((v) => v !== item));
    }
    onItemChecked?.(item, checked);
  }

  function handleAllItemsChecked(checked) {
    if (checked) {
      setCheckedItems(listItems);
    } else {
      setCheckedItems([]);
    }
    onAllItemsChecked?.(checked ? listItems : [], checked);
  }

  return <>{listItems?.length > 0 && <>
    <Table
      hover
      responsive
      style={{
        height: '100%',
        overflowY: 'auto'
      }}
    >
      <thead style={{position: 'sticky', top: 0,}}>
      <tr>
        {onItemChecked && <th onClick={(e) => {
          e.stopPropagation()
        }}>
          {onAllItemsChecked && <Form.Check
            role={'button'}
            onChange={(e) => handleAllItemsChecked(e.target.checked)}
          />}
        </th>}
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('SubscriberID')}
        >
          ID
          {sortKey === 'SubscriberID' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('SubscriberName')}
        >
          Name
          {sortKey === 'SubscriberName' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('SubscriberMobileNumber')}
        >
          Mobile
          {sortKey === 'SubscriberMobileNumber' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('SubscriberEmail')}
        >
          Email
          {sortKey === 'SubscriberEmail' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('Created')}
        >
          Created
          {sortKey === 'Created' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
      </tr>
      </thead>
      <tbody>
      {listItems.map((listItem) =>
        <tr
          key={listItem.SubscriberID}
          onClick={() => setEditItem(listItem)}
          role={'button'}
        >
          {onItemChecked && <td onClick={(e) => {
            e.stopPropagation()
          }}>
            <Form.Check
              role={'button'}
              checked={checkedItems.includes(listItem)}
              onChange={(e) => {
                handleItemChecked(listItem, e.target.checked);
              }}
            />
          </td>}
          <td>{listItem.SubscriberID}</td>
          <td>{listItem.SubscriberName}</td>
          <td>{listItem.SubscriberMobileNumber}</td>
          <td>{listItem.SubscriberEmail}</td>
          <td className={'text-nowrap'}>
            {Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            }).format(Date.parse(listItem.Created))}
          </td>
        </tr>
      )}
      </tbody>
    </Table>
    <FormEditor>
      <SmsSubscriberModal show={editItem} subscriber={editItem} onHide={() => setEditItem(null)}/>
    </FormEditor>
  </>}
  </>
}