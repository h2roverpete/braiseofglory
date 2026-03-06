import EditorPanel from "../../editor/EditorPanel";
import {useRestApi} from "../../../api/RestApi";
import {usePageContext} from "../../content/Page";
import {useFormData} from "../../editor/FormEditor";
import {useEffect} from "react";
import FileExtraFields from "./FileExtraFields";
import {useSiteContext} from "../../content/Site";

export default function FileExtraConfig({extraData, buttonRef}) {

  const {Extras} = useRestApi();
  const {updateExtra, removeExtraFromPage} = usePageContext();
  const {showErrorAlert} = useSiteContext();

  /** @type FormDataAPI<ExtraData> */
  const formData = useFormData();

  useEffect(() => {
    formData.setData(extraData);
  }, [extraData, formData]);

  function onUpdate() {
    console.debug(`Updating extra.`);
    Extras.insertOrUpdateExtra(formData.edits).then((extra) => {
      console.debug(`Extra updated.`);
      formData.update(extra);
    }).catch((err) => {
      showErrorAlert(`Error updating extra.`, err);
    });
    updateExtra(formData.edits);
  }

  function onDelete() {
    console.debug(`Deleting extra.`);
    Extras.deleteExtra(extraData.ExtraID).then(() => {
      console.debug(`Extra deleted.`);
    }).catch((err) => {
      showErrorAlert(`Error deleting extra.`, err);
    });
    removeExtraFromPage(extraData.ExtraID);
  }

  return (
    <EditorPanel
      onUpdate={onUpdate}
      onDelete={onDelete}
      isDataValid={() => true}
      buttonRef={buttonRef}
    >
      <h5>File Properties</h5>
      <FileExtraFields/>
    </EditorPanel>
  );
}