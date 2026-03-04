import {Col, Form, Row} from "react-bootstrap";
import {useFormData} from "../../editor/FormEditor";
import {useEffect} from "react";
import FileExtraIcon, {IconList} from "./FileExtraIcon";

export default function FileExtraFields() {

  const formData = useFormData();
  useEffect(() => {
    // set default values for display
    if (formData && !formData.edits.DisplayWidth) {
      formData.onDataChanged({name: 'DisplayWidth', value: 6})
    }
  }, [formData]);

  const labelCols = 4;
  return (<>
    <Row className="mt-2">
      <Form.Label
        className='required'
        column={'sm'}
        htmlFor={'ExtraFile'}
        sm={labelCols}
      >
        File to Upload
      </Form.Label>
      <Col>
        <Form.Control
          type="file"
          id="ExtraFile"
          name="ExtraFile"
          size="sm"
          onChange={(e) => formData.onDataChanged({name: 'ExtraFile', value: e.target.files[0]})}
        />
      </Col>
    </Row>
    <Row
      className="mt-2"
      hidden={!formData.edits.ExtraFile || formData.edits.ExtraFile.type?.startsWith('text/')}
    >
      <Form.Label
        column={'sm'}
        htmlFor={'ExtraFile'}
        sm={labelCols}
      >
        Prompt for Links
      </Form.Label>
      <Col>
        <Form.Control
          id="ExtraFilePrompt"
          name="ExtraFilePrompt"
          value={formData.edits.ExtraFilePrompt || ''}
          size="sm"
          onChange={(e) => formData.onDataChanged({name: 'ExtraFilePrompt', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row className="mt-2">
      <Form.Label
        column={'sm'}
        htmlFor={'ExtraFileIcon'}
        sm={labelCols}
      >
        Icon
      </Form.Label>
      <Col className="col-1 me-2">
        <FileExtraIcon type={formData.edits.ExtraFileIcon} size={40}/>
      </Col>
      <Col xs='auto' style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Form.Select
          type="select"
          size="sm"
          name={'ExtraFileIcon'}
          value={formData.edits.ExtraFileIcon || ''}
          onChange={(e) => formData.onDataChanged({name: 'ExtraFileIcon', value: e.target.value})}
        >
          <option value=''>(none)</option>
          {IconList.map((item, index) => (
            <option key={index} value={item.value}>{item.label}</option>
          ))}
        </Form.Select>
      </Col>
    </Row>
    <Row className="mt-2">
      <Form.Label
        htmlFor={"DisplayWidth"}
        column={'sm'}
        sm={labelCols}
      >
        Display Width
      </Form.Label>
      <Col sm={3}>
        <Form.Control
          type={'number'}
          id={'DisplayWidth'}
          value={formData.edits.DisplayWidth || 6}
          size={"sm"}
          min={1}
          max={12}
          onChange={(e) => formData.onDataChanged({name: 'DisplayWidth', value: parseInt(e.target.value)})}
        />
      </Col>
    </Row>
  </>);
}