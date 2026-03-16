import {Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Form, Spinner} from "react-bootstrap";
import {useCallback, useEffect, useState} from "react";
import {useSiteContext} from "../content/Site";
import {useRestApi} from "../../api/RestApi";

/**
 * @typedef ImageDescription
 *
 * @property {string} description   Text description of image for alt text.
 * @property {string} keywords      Comma delimited list of keywords for searching.
 */

/**
 * Modal for adding description and keywords to images.
 *
 * @param show {boolean}                          Flag to show/hide the modal.
 * @param onHide {function()}                     Callback requesting to hide the modal.
 * @param onSubmit {function(ImageDescription)}   Callback to receive description of the image.
 * @param s3uri {string}                          S3 uri to the image. i.e. 's3://my-bucket/path/to/file.jpg'
 * @param description {string}                    Default description to display.
 * @param keywords {string}                       Default keywords to display.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function DescribeImageModal(
  {
    show,
    onHide,
    onSubmit,
    s3uri,
    description = '',
    keywords = '',
  }
) {

  const {showErrorAlert} = useSiteContext();
  const {Files} = useRestApi();

  const [imageDescription, setDescription] = useState('');
  const [imageKeywords, setKeywords] = useState('');
  const [generating, setGenerating] = useState(false);

  const refresh = useCallback(() => {
    setGenerating(true);
    Files.describeFile(s3uri)
      .then(result => {
        setDescription(result.description);
      })
      .catch(error => showErrorAlert(`Error generating image description.`, error));
    Files.describeFile(s3uri, 'Create a comma delimited list of 10 keywords for this image')
      .then(result => {
        setKeywords(result.description);
      })
      .catch(error => showErrorAlert(`Error generating image keywords.`, error));
  }, [setGenerating, Files, setKeywords, setDescription, s3uri, showErrorAlert]);

  useEffect(() => {
    setDescription(description);
    setKeywords(keywords);
  }, [description, keywords]);

  useEffect(() => {
    if (generating && imageKeywords && imageDescription) {
      // generation complete
      setGenerating(false);
    }
  }, [imageKeywords, imageDescription, generating, setGenerating]);

  useEffect(() => {
    if (show && !generating && !imageKeywords && !imageDescription) {
      // trigger initial refresh
      refresh()
    }
  }, [show, imageKeywords, imageDescription, generating, refresh]);

  function onCancel() {
    onHide?.();
  }

  function onSetDescription() {
    onSubmit?.({
      description: imageDescription,
      keywords: imageKeywords,
    });
  }

  function onRefresh() {
    setDescription('');
    setKeywords('');
    refresh();
  }


  return (
    <Modal show={show}>
      <ModalHeader>
        <h5>Describe Image</h5>
      </ModalHeader>
      <ModalBody>
        <>
          {generating && (<>
            <Row className="mt-0">
              <Spinner className="ms-3"/>
              <Form.Label column="sm">Generating image description...</Form.Label>
            </Row>
          </>)}
          {imageDescription.length > 0 && (<>
            <Row className="mt-0">
              <Form.Label column="sm">Description</Form.Label>
            </Row>
            <Row className="mt-2">
              <Col>
                <Form.Control
                  as="textarea"
                  rows={2}
                  size="sm"
                  value={imageDescription}
                  onChange={e => setDescription(e.target.value)}
                />
              </Col>
            </Row>
          </>)}
          {imageKeywords.length > 0 && (<>
            <Row className="mt-2">
              <Form.Label column="sm">Keywords</Form.Label>
            </Row>
            <Row className="mt-2">
              <Col>
                <Form.Control
                  as="textarea"
                  rows={2}
                  size={"sm"}
                  value={imageKeywords}
                  onChange={e => setKeywords(e.target.value)}
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
            Update
          </Button>
        </Col>
      </ModalFooter>
    </Modal>
  )
}
