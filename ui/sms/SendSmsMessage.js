import SendSmsMessageFields from "./SendSmsMessageFields";
import FormEditor from "../editor/FormEditor";

export default function SendSmsMessage(props) {
  return <>
    <FormEditor>
      <SendSmsMessageFields {...props} />
    </FormEditor>
  </>
}