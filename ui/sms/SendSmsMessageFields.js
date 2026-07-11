/**
 * @typedef SendSmsMessageProps
 * @property {Number} smsCampaignId
 */

import {useAuth} from "../../auth/AuthProvider";
import {useSiteContext} from "../content/Site";
import {useEffect, useState} from "react";
import {Permission, Resource} from "../../auth/Permissions";

/**
 *
 * @param props{SendSmsMessageProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function SendSmsMessageFields(props) {

  const {currentUser, hasPermission} = useAuth();
  const {currentPage} = useSiteContext();

  const [canSendMessages, setCanSendMessages] = useState(false);

  useEffect(() => {
    setCanSendMessages(hasPermission(Permission.SEND, Resource.SMS));
  }, hasPermission);


  return <>
    {canSendMessages && <FormData>
      <SendSmsMessageFields {props} />
    </FormData>}
  </>
}