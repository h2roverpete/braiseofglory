import {Button, Col, Modal, ModalBody, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import '../editor/Editor.css'
import TextMessagePreview from "./TextMessagePreview";
import EmailPreview from "./EmailPreview";

export default function SmsLogEntryModal({campaign, logEntry, show, onHide}) {

  const {Users, SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  const [user, setUser] = useState(/** @type {NewUserData} */ null);
  const [subscriber, setSubscriber] = useState(/** @type {SMSSubscriberData} */null);
  const [message, setMessage] = useState(/** @type {SMSMessageData} */null);

  useEffect(() => {
    if (logEntry?.UserID) {
      Users.getUser(logEntry.UserID).then(result => {
        setUser(result);
      }).catch(error => {
        showErrorAlert(error);
      })
    } else if (message?.UserID) {
      Users.getUser(message.UserID).then(result => {
        setUser(result);
      }).catch(error => {
        showErrorAlert(error);
      })
    }
  }, [logEntry, Users, showErrorAlert, setUser, message]);

  useEffect(() => {
    if (logEntry?.SubscriberID) {
      SMS.getSmsSubscriber(logEntry.SMSCampaignID, logEntry.SubscriberID).then(result => {
        setSubscriber(result);
      }).catch(error => {
        showErrorAlert(error);
      })
    }
  }, [logEntry, SMS, showErrorAlert, setSubscriber]);

  useEffect(() => {
    if (logEntry?.SMSMessageID) {
      SMS.getSmsMessage(logEntry.SMSCampaignID, logEntry.SMSMessageID).then(result => {
        setMessage(result);
      }).catch(error => {
        showErrorAlert(error);
      })
    }
  }, [logEntry, SMS, showErrorAlert, setMessage]);

  const labelCols = 3;
  return <Modal show={show} onHide={onHide} className={'Editor'}>
    <ModalBody>
      <Row>
        <Col><h5>SMS Log Entry</h5></Col>
      </Row>
      {logEntry?.Created &&
        <Row>
          <Col xs={labelCols}>
            Timestamp:
          </Col>
          <Col>
            {Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            }).format(Date.parse(logEntry.Created))}
          </Col>
        </Row>
      }
      {logEntry?.Action &&
        <Row>
          <Col xs={labelCols}>
            Action:
          </Col>
          <Col>
            {logEntry.Action}
          </Col>
        </Row>
      }
      {logEntry?.Subscriber &&
        <Row>
          <Col xs={labelCols}>
            Subscriber:
          </Col>
          <Col>
            {logEntry?.SubscriberID && subscriber &&
              <>{subscriber.SubscriberName} </>
            }
            &lt;{logEntry.Subscriber}&gt;
          </Col>
        </Row>
      }
      {logEntry?.UserID && user &&
        <Row>
          <Col xs={labelCols}>
            Admin User:
          </Col>
          <Col>
            {user.UserName}
          </Col>
        </Row>
      }
      {logEntry &&
        <Row>
          <Col xs={labelCols}>
            Result:
          </Col>
          <Col>
            {logEntry.Error ?
              <span className={'text-danger'}>{logEntry.Error}</span>
              :
              <span className={'text-success'}>Sent</span>
            }
          </Col>
        </Row>
      }
      {logEntry?.ForwardedMessage ? <>
          <Row className="mt-2">
            <Col>
              <TextMessagePreview text={logEntry.ForwardedMessage}/>
            </Col>
          </Row></>
        :
        <>{logEntry?.MessageID && message ?
          <Row className="mt-2">
            <Col>
              {logEntry.Action.indexOf('Sms') >= 0 ?
                <TextMessagePreview text={message.Message} campaign={campaign}/>
                :
                <EmailPreview message={message} campaign={campaign} subscriber={subscriber}/>
              }
            </Col>
          </Row>
          :
          <>{logEntry?.Action === 'SendSmsWelcome' && <Row className="mt-2">
            <Col>
              <TextMessagePreview text={campaign.CampaignConfirmationMessage}/>
            </Col>
          </Row>}</>
        }
        </>
      }
      <Row>
        <Col>
          <Button
            variant={'secondary'}
            onClick={onHide}
            size="sm"
            className={'mt-3'}
          >
            Done
          </Button>
        </Col>
      </Row>

    </ModalBody>
  </Modal>
}