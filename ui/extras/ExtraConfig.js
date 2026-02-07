import {Col, Form, Row} from "react-bootstrap";
import EditorPanel from "../editor/EditorPanel";
import {useEdit} from "../editor/EditProvider";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "../content/Page";
import {useFormEditor} from "../editor/FormEditor";
import {useEffect} from "react";

export default function ExtraConfig({extraData, buttonRef}) {

  const {canEdit} = useEdit();
  const {Extras} = useRestApi();
  const {updateExtra, removeExtraFromPage} = usePageContext();
  const {edits, FormData} = useFormEditor();

  useEffect(() => {
    FormData.setData(extraData);
  }, [extraData, FormData]);

  if (!canEdit) {
    return <></>;
  }

  const labelCols = 2;

  return (
    <EditorPanel
      onUpdate={() => {
        console.debug(`Updating extra.`);
        Extras.insertOrUpdateExtra(edits).then((extra) => {
          console.debug(`Extra updated.`);
          FormData.update(extra);
          updateExtra(extra);
        }).catch((err) => {
          console.error(`Error updating extra.`, err);
        });
      }}
      onDelete={() => {
        console.debug(`Deleting extra.`);
        Extras.deleteExtra(extraData.ExtraID).then(() => {
          console.debug(`Extra deleted.`);
          removeExtraFromPage(extraData.ExtraID);
        }).catch((err) => {
          console.error(`Error deleting extra.`, err);
        });
      }}
      isDataValid={() => true}
      buttonRef={buttonRef}
    >
      <h5>File Properties</h5>
      <Row className="mt-2">
        <Form.Label
          column={'sm'}
          sm={labelCols}
          htmlFor={'CurrentFile'}>Current File</Form.Label>
        <Col>
          <Form.Control
            size={'sm'}
            id={'CurrentFile'}
            value={extraData.ExtraFile}
            readOnly={true}
            disabled={true}
          />
        </Col>
      </Row>
      <Row className="mt-2">
        <Form.Label
          column={'sm'}
          sm={labelCols}
          htmlFor={'ExtraFile'}>Replace File</Form.Label>
        <Col>
          <Form.Control
            type={'file'}
            size={'sm'}
            id={'ExtraFile'}
            onChange={(e) => {
              FormData.onDataChanged({
                  changes: [
                    {name: 'ExtraFile', value: e.target.files[0]},
                    {name: 'ExtraFileMimeType', value: e.target.files[0].type}
                  ]
                }
              );
            }}
          />
        </Col>
      </Row>
      <Row
        className="mt-2"
        hidden={edits?.ExtraFileMimeType?.startsWith('text/')}
      >
        <Form.Label
          column={'sm'}
          sm={labelCols}
          htmlFor={'ExtraFilePrompt'}>File Prompt</Form.Label>
        <Col>
          <Form.Control
            size={'sm'}
            id={'ExtraFilePrompt'}
            value={edits?.ExtraFilePrompt || ''}
            onChange={(e) => FormData.onDataChanged({name: 'ExtraFilePrompt', value: e.target.value})}
          />
        </Col>
      </Row>
    </EditorPanel>
  );
}