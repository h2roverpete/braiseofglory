import {useEdit} from "../editor/EditProvider";
import {Row, Form, Col, Button, Modal} from "react-bootstrap";
import {useEffect, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "../content/Page";
import EditorPanel from "../editor/EditorPanel";
import {useFormEditor} from "../editor/FormEditor";

export default function GalleryConfig({galleryConfig, setGalleryConfig, extraId, buttonRef, ref}) {

  const {canEdit} = useEdit();
  const {Galleries, Extras} = useRestApi();
  const {removeExtraFromPage} = usePageContext();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const {edits, FormData} = useFormEditor();
  useEffect(() => {
    FormData.update(galleryConfig);
  }, [galleryConfig]);

  if (!canEdit) {
    return <></>
  }

  function isDataValid() {
    return edits?.GalleryName?.length > 0;
  }

  function onUpdate() {
    console.debug(`Updating gallery.`);
    Galleries.insertOrUpdateGallery(edits)
      .then((result) => {
        FormData?.update(result);
        setGalleryConfig(result);
      })
      .catch((err) => {
        console.error(`Error updating gallery.`, err);
      })
  }

  function onRemoveFromSection() {
    Extras.deleteExtra(extraId).then(() => {
      removeExtraFromPage(extraId);
    })
  }

  function onDeleteGallery() {
    console.debug(`Delete gallery....`);
    Galleries.deleteGallery(galleryConfig.GalleryID).then(() => {
      console.debug(`Gallery deleted.`);
      if (extraId) {
        Extras.deleteExtra(extraId).then(() => {
          console.debug(`Gallery extra deleted.`);
          removeExtraFromPage(extraId);
        }).catch(err => console.error(`Error deleting gallery extra.`, err));
      }
    }).catch(err => console.error(`Error deleting gallery.`, err));
  }

  const labelCols = 3;

  return (<>
    <Modal
      show={showDeleteConfirmation}
      onClose={() => setShowDeleteConfirmation(false)}
      className={'Editor'}
    >
      <Modal.Header><h5>Delete Gallery</h5></Modal.Header>
      <Modal.Body>Are you sure you want to delete '{galleryConfig?.GalleryName}' gallery? This action can't be
        undone.</Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
        <Button size="sm" variant="danger" onClick={onDeleteGallery}>Delete
        </Button>
      </Modal.Footer>
    </Modal>
    <EditorPanel
      extraButtons={<>
        {extraId && (
          <Button
            className="me-2"
            size={'sm'}
            variant="secondary"
            onClick={onRemoveFromSection}
          >
            <span className={'d-none d-sm-block'}>Remove from Section</span>
            <span className={'d-block d-sm-none'}>Remove</span>
          </Button>
        )}
      </>}
      onUpdate={onUpdate}
      isDataValid={isDataValid}
      onDelete={() => setShowDeleteConfirmation(true)}
      buttonRef={buttonRef}
      ref={ref}
    >
      <h5>Gallery Properties</h5>
      <Row>
        <Form.Label
          column={'sm'}
          className="required"
          sm={labelCols}
          htmlFor={'GalleryName'}
        >
          Gallery Name
        </Form.Label>
        <Col>
          <Form.Control
            size={'sm'}
            id={'GalleryName'}
            isValid={FormData?.isTouched('GalleryName') && edits?.GalleryName.length > 0}
            isInvalid={FormData?.isTouched('GalleryName') && edits?.GalleryName.length === 0}
            value={edits?.GalleryName || ''}
            onChange={(e) => FormData?.onDataChanged({name: 'GalleryName', value: e.target.value})}
          />
        </Col>
      </Row>
      <Row className={'mt-2'}>
        <Col sm={labelCols}></Col>
        <Col>
          <Form.Check
            checked={edits?.RandomizeOrder === true}
            label="Randomize display order"
            onChange={(e) => FormData?.onDataChanged({name: 'RandomizeOrder', value: e.target.checked})}
          />
        </Col>
      </Row>
    </EditorPanel>
  </>)
}