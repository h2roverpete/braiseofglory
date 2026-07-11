import SendSmsMessageFields from "./SendSmsMessageFields";
import {useSiteContext} from "../content/Site";
import {useAuth} from "../../auth/AuthProvider";

export default function SendSmsMessage(props) {

  const {currentPage} = useSiteContext();
  const {hasPermission} = useAuth();

  return <>
    {currentPage?.PageID === props.pageId && <FormData>
      <SendSmsMessageFields {props} />
    </FormData>}
  </>
}