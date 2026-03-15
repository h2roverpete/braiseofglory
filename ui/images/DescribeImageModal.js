import {Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Form, Spinner} from "react-bootstrap";
import {useEffect, useState} from "react";
import {useSiteContext} from "../content/Site";
import {useRestApi} from "../../api/RestApi";

/**
 *
 * @param show {boolean}
 * @param onHide {function()}
 * @param onSubmit {function(string)}
 * @param photoUrl {string}
 * @returns {JSX.Element}
 * @constructor
 */
export default function DescribeImageModal(
  {
    show,
    onHide,
    onSubmit,
    s3uri,
  }
) {

  const {showErrorAlert} = useSiteContext();
  const {Images} = useRestApi();

  const [generating, setGenerating] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!generating && show && !description) {
      setGenerating(true);
      Images.generateImageDescription(s3uri)
        .then(result => {
          setDescription(result.description);
          setGenerating(false);
        })
        .catch(error => showErrorAlert(`Error generating image description.`, error));
    }
  }, [description, show, setGenerating, generating, Images, s3uri, showErrorAlert]);

  function onCancel() {
    onHide?.();
    setDescription('');
  }

  function onSetDescription() {
    onSubmit?.(description)
    setDescription('');
  }

  function onRefresh() {
    setDescription('');
  }

  return (
    <Modal show={show}>
      <ModalHeader>
        <h5>Describe Image</h5>
      </ModalHeader>
      <ModalBody>
        <>
          {generating && (<>
            <Row className="mt-3">
              <Spinner className="ms-3"/>
              <Form.Label column="sm">Generating image description...</Form.Label>
            </Row>
          </>)}
          {description.length > 0 && (<>
            <Row className="mt-0">
              <Form.Label column="sm">Image description</Form.Label>
            </Row>
            <Row className="mt-2">
              <Col>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </Col>
            </Row>
          </>)}
        </>
      </ModalBody>
      <ModalFooter>
        <Col className="text-start">
          <Button
            size="sm"
            variant="secondary"
            className="me-2"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </Col>
        <Col className='text-end'>
          <Button
            size="sm"
            variant="secondary"
            className="me-2"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="me-2"
            onClick={onSetDescription}
          >
            Set Description
          </Button>
        </Col>
      </ModalFooter>
    </Modal>
  )
}
