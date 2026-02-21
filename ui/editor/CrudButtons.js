import {Button, Col, Row} from "react-bootstrap";
import {useFormData} from "./FormEditor";

export default function CrudButtons({keyName, type, onUpdate, onCancel, onDelete, isDataValid, extraButtons}) {

  const formData = useFormData();

  return (<Row className={'mt-4'}>
    <Col xs={'auto'} className={'pe-0'}>
      {onUpdate && isDataValid && (
        <Button
          className="me-2"
          size={'sm'}
          variant="primary"
          onClick={() => {
            onUpdate?.(formData.edits);
          }}
          disabled={!isDataValid(formData.edits) || !formData.isDataChanged()}
        >
          {formData.edits[keyName] ? `Update ${type ? type : ''}` : `Add ${type ? type : ''}`}
        </Button>
      )}
      <Button
        size={'sm'}
        variant="secondary"
        onClick={() => formData.revert()}
        disabled={!formData.isDataChanged()}
      >
        Revert
      </Button>
    </Col>
    <Col style={{textAlign: 'end'}} className={'ps-0'}>
      {extraButtons}
      {onCancel && (
        <Button
          className="me-2"
          size={'sm'}
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
      {onDelete && formData.edits[keyName] && (
        <Button
          size={'sm'}
          variant="danger"
          onClick={() => onDelete(formData.edits)}
        >
          Delete
        </Button>
      )}
    </Col>
  </Row>);
}