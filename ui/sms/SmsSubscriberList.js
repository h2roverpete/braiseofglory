import {useAuth} from "framework/auth/AuthProvider";
import {useCallback, useEffect, useState} from "react";
import {Resource, Permission} from "framework/auth/Permissions";
import {Button, Col, OverlayTrigger, Row, Table, Tooltip} from "react-bootstrap";
import {useRestApi} from "framework/api/RestApi";
import {BsSortDown, BsSortUp} from "react-icons/bs";
import "../css/EditableRow.css";
import FormEditor from "framework/ui/editor/FormEditor";
import SmsSubscriberModal from "framework/ui/sms/SmsSubscriberModal";

export default function SmsSubscriberList({campaign}) {

  const {SMS} = useRestApi();
  const {hasPermission} = useAuth();

  const [canEdit, setCanEdit] = useState(false);
  const [subscribers, setSubscribers] = useState(/** @type {[SMSSubscriberData]} */ null);
  const [sortKey, setSortKey] = useState('Created');
  const [sortAscending, setSortAscending] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    setCanEdit(hasPermission(Resource.SMS, Permission.ADMIN));
  }, [hasPermission, setCanEdit]);

  useEffect(() => {
    if (campaign && !subscribers) {
      SMS.getSmsCampaignSubscribers(campaign.SMSCampaignID).then((result) => {
        setSubscribers(result);
      });
    }
  }, [SMS, campaign, subscribers, setSubscribers]);

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

  function sortBy(key) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortAscending(true);
    } else {
      setSortAscending(!sortAscending);
    }
  }

  useEffect(() => {
    if (subscribers) {
      const sorted = subscribers.toSorted(sortFunction);
      if (!arraysAreEqual(subscribers, sorted)) {
        setSubscribers(sorted);
      }
    }
  }, [setSubscribers, subscribers, sortKey, sortAscending, sortFunction]);

  function onEditItem(item) {
    setEditItem(item);
  }

  function handleAdd(data) {
    setSubscribers([subscribers, ...[data]]);
  }

  function handleUpdate(data) {
    let newSubscribers = [];
    for (const subscriber of subscribers) {
      if (subscriber.SubscriberID === data.SubscriberID) {
        newSubscribers.push(data);
      } else {
        newSubscribers.push(subscriber);
      }
    }
    setSubscribers(newSubscribers);
  }

  function handleDelete(data) {
    let newSubscribers = [];
    for (const subscriber of subscribers) {
      if (subscriber.SubscriberID !== data.SubscriberID) {
        newSubscribers.push(subscriber);
      }
    }
    setSubscribers(newSubscribers);
  }

  function handleCancel() {
    setEditItem(null);
  }

  return <>{canEdit && subscribers && <>
    {campaign && <>
      <Table
        hover
        responsive
        style={{
          height: "100%",
          overflowY: 'scroll'
        }}
      >
        <thead style={{position: 'sticky', top: 0,}}>
        <tr>
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
        {subscribers.map((subscriber) => (
          <tr
            className={'EditableRow'}
            key={subscriber.SubscriberID}
            onClick={(e) => {
              onEditItem(subscriber);
              e.stopPropagation();
            }}
          >
            <td>
              {subscriber.SubscriberID}
            </td>
            <td className={`${subscriber.Unsubscribed ? ' text-danger' : ''}`}>
              {subscriber.SubscriberName}
            </td>
            <td>{subscriber.SubscriberMobileNumber}</td>
            <td>{subscriber.SubscriberEmail}</td>
            <td>{Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }).format(Date.parse(subscriber.Created))}</td>
          </tr>
        ))}
        </tbody>
      </Table>
      <Row className="mt-3">
        <Col>
          <Button variant="primary" onClick={() => setEditItem({SMSCampaignID: campaign.SMSCampaignID})}>
            Add Subscriber
          </Button>
        </Col>
      </Row>
    </>}
  </>}
    <FormEditor>
      <SmsSubscriberModal
        show={editItem !== null}
        onHide={handleCancel}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        subscriber={editItem}
      />
    </FormEditor>
  </>
}