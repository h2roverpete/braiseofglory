import SendSmsMessageFields from "./SendSmsMessageFields";
import FormEditor from "../editor/FormEditor";

export default function SendSmsMessage({campaign}) {
  return <>
    <FormEditor>
      <SendSmsMessageFields campaign={campaign} />
    </FormEditor>
  </>
}