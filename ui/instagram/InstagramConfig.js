import {useEdit} from "../editor/EditProvider";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "../content/Page";
import {Col, Row, Form} from "react-bootstrap";
import EditorPanel from "../editor/EditorPanel";
import {useFormEditor} from "../editor/FormEditor";
import {useEffect} from "react";

export default function InstagramConfig({extraData, setExtraData, buttonRef}) {

  const {canEdit} = useEdit();
  const {Extras} = useRestApi();
  const {removeExtraFromPage} = usePageContext();
  const {edits, FormData} = useFormEditor();
  useEffect(() => {
    FormData?.update(extraData);
  }, [extraData]);

  if (!canEdit) {
    return <></>;
  }

  function isValidInstagramHandle(value) {
    return value && /^@[a-zA-Z0-9\-.]+$/.test(value);
  }

  function onUpdate() {
    console.debug(`Updating instagram extra.`);
    Extras.insertOrUpdateExtra(edits)
      .then((result) => {
        setExtraData(result);
      })
      .catch((err) => {
        console.error(`Error updating extra.`, err);
      })
  }

  function onDelete() {
    console.debug(`Delete extra....`);
    Extras.deleteExtra(extraData.ExtraID).then(() => {
      console.debug(`Extra deleted.`);
      removeExtraFromPage(extraData.ExtraID);
    }).catch((e) => console.error(`Error deleting extra.`, e));
  }

  const labelCols = 3;
  return (
    <EditorPanel
      onDelete={onDelete}
      onUpdate={onUpdate}
      buttonRef={buttonRef}
      isDataValid={() => isValidInstagramHandle(edits?.InstagramHandle)}
    >
      <h5>Instagram Properties</h5>
      <Row>
        <Form.Label
          column={'sm'}
          sm={labelCols}
          htmlFor={'GalleryName'}>Instagram Handle</Form.Label>
        <Col>
          <Form.Control
            size={'sm'}
            id={'GalleryName'}
            isValid={FormData?.isTouched('InstagramHandle') && isValidInstagramHandle(edits?.InstagramHandle)}
            isInvalid={FormData?.isTouched('InstagramHandle') && !isValidInstagramHandle(edits?.InstagramHandle)}
            value={edits?.InstagramHandle || ''}
            onChange={(e) => FormData?.onDataChanged({name: 'InstagramHandle', value: e.target.value})}
          />
        </Col>
      </Row>
    </EditorPanel>
  )
}