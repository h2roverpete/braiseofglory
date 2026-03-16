import EditorPanel from "../../editor/EditorPanel";
import {useRestApi} from "../../../api/RestApi";
import {usePageContext} from "../../content/Page";
import {useFormData} from "../../editor/FormEditor";
import {useEffect, useState} from "react";
import FileExtraFields from "./FileExtraFields";
import {useSiteContext} from "../../content/Site";
import {Button} from "react-bootstrap";

export default function FileExtraConfig({extraData, buttonRef}) {

  const {Extras, Files} = useRestApi();
  const {updateExtra, removeExtraFromPage} = usePageContext();
  const {showErrorAlert, siteData} = useSiteContext();

  /** @type FormDataAPI<ExtraData> */
  const formData = useFormData();

  const [fetchingDescription, setFetchingDescription] = useState();
  const [fetchingKeywords, setFetchingKeywords] = useState();

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

  function onDescribe() {
    formData.onDataChanged([
      {name: 'ExtraDescription', value: 'description'},
      {name: 'ExtraKeywords', value: ''},
    ])
    setFetchingDescription(true);
    setFetchingKeywords(true);
    Files.describeFile(
      `s3://${siteData.SiteBucketName}/${extraData.ExtraFile}`,
      `summarize the contents in one sentence`
    ).then((result) => {
      formData.onDataChanged({name: 'ExtraDescription', value: result.description});
      setFetchingDescription(false);
    }).catch((err) => showErrorAlert(`Error generating description.`, err));
    Files.describeFile(
      `s3://${siteData.SiteBucketName}/${extraData.ExtraFile}`,
      `generate a comma delimited list of 10 keywords about the contents`
    ).then((result) => {
      formData.onDataChanged({name: 'ExtraKeywords', value: result.description});
      setFetchingKeywords(false);
    }).catch((err) => showErrorAlert(`Error generating keywords.`, err));
  }

  const extraButtons = (
    <Button
      variant={'secondary'}
      size={'sm'}
      className={'me-2'}
      onClick={onDescribe}
    >
      Describe
    </Button>
  );

  return (
    <EditorPanel
      onUpdate={onUpdate}
      onDelete={onDelete}
      isDataValid={() => true}
      buttonRef={buttonRef}
      extraButtons={extraButtons}
    >
      <h5>File Properties</h5>
      <FileExtraFields
        fetchingDescription={fetchingDescription || fetchingKeywords}
      />
    </EditorPanel>
  );
}