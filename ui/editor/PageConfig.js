import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import {useFormEditor} from "./FormEditor";
import {useEffect, useState} from "react";
import {useSiteContext} from "../content/Site";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "../content/Page";

export default function PageConfig({onPageUpdated, onPageDeleted}) {

  const {Pages} = useRestApi();
  const {Outline, outlineData} = useSiteContext()
  const {pageData, setPageData} = usePageContext();
  const {edits, FormData} = useFormEditor();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    FormData.update(pageData);
  }, [pageData])
  useEffect(() => {
    if (outlineData && pageData) {
      const routeList = [];
      for (const page of outlineData) {
        if (page.PageID !== pageData.PageID) {
          routeList.push(page.PageRoute);
        }
      }
      setRoutes(routeList);
    }
  }, [outlineData, pageData]);

  function isDataValid() {
    return isValidRoute(edits?.PageRoute)
  }

  function onUpdate() {
    console.debug(`Updating page...`);
    Pages.insertOrUpdatePage(edits).then((result) => {
      console.debug(`Updated page.`);
      FormData?.update(result)
      Outline.updatePage(result);
      setPageData(result);
    }).catch((error) => {
      console.error(`Error updating page.`, error);
    });
    onPageUpdated?.();
  }

  function onDelete() {
    console.debug(`Deleting page...`);
    Pages.deletePage(pageData.PageID)
      .then(() => {
        console.debug(`Deleted page.`);
        Outline.deletePage(pageData.PageID);

      })
      .catch(e => console.error(`Error deleting page.`, e));
    onPageDeleted?.();
  }

  function isValidRoute(route) {
    return route?.match(/^\/[a-z0-9]+/) && !routes.includes(route);
  }

  return (<>
    <Row><Col><h5>Page Properties</h5></Col></Row>
    <Row>
      <Col sm={4}>
        <Form.Label
          htmlFor={'NavTitle'}
          column={'sm'}
        >
          Navigation Title
        </Form.Label>
        <Form.Control
          size={'sm'}
          id={'NavTitle'}
          name={'NavTitle'}
          value={edits?.NavTitle || ''}
          onChange={(e) => FormData?.onDataChanged({name: 'NavTitle', value: e.target.value})}
        />
      </Col>

      <Col sm={3}>
        <Form.Label
          htmlFor={'PageRoute'}
          column={'sm'}
        >
          Page Route
        </Form.Label>
        <Form.Control
          size={'sm'}
          id={'PageRoute'}
          name={'PageRoute'}
          isValid={FormData?.isTouched('PageRoute') && isValidRoute(edits?.PageRoute)}
          isInvalid={FormData?.isTouched('PageRoute') && !isValidRoute(edits?.PageRoute)}
          value={edits?.PageRoute || ''}
          onChange={(e) => FormData?.onDataChanged({name: 'PageRoute', value: e.target.value})}
        />
      </Col>
      <Col>
        <Form.Label
          column={'sm'}
          htmlFor={'PageMetaTitle'}
        >
          Meta Title
        </Form.Label>
        <Form.Control
          size={'sm'}
          id={'PageMetaTitle'}
          value={edits?.PageMetaTitle || ''}
          onChange={(e) => FormData?.onDataChanged({name: 'PageMetaTitle', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row>
      <Col sm={6}>
        <Form.Label
          column={'sm'}
          htmlFor={'PageMetaDescription'}
        >
          Meta Description
        </Form.Label>
        <Form.Control
          size={'sm'}
          id={'PageMetaDescription'}
          value={edits?.PageMetaDescription || ''}
          onChange={(e) => FormData?.onDataChanged({name: 'PageMetaDescription', value: e.target.value})}
        />
      </Col>
      <Col sm={6}>
        <Form.Label
          column={'sm'}
          htmlFor={'PageMetaKeywords'}
        >
          Meta Keywords
        </Form.Label>
        <Form.Control
          size={'sm'}
          id={'PageMetaKeywords'}
          value={edits?.PageMetaKeywords || ''}
          onChange={(e) => FormData?.onDataChanged({name: 'PageMetaKeywords', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <Form.Check
          className={'form-control-sm'}
          checked={edits?.PageHidden || false}
          id={'PageHidden'}
          label={'Hide page from site navigation'}
          onChange={(e) => FormData?.onDataChanged({name: 'PageHidden', value: e.target.checked})}
        />
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Col xs={'auto'} className={'pe-0'}>
        {onUpdate && isDataValid && (
          <Button
            className="me-2"
            size={'sm'}
            variant="primary"
            onClick={() => {
              onUpdate?.();
            }}
            disabled={!isDataValid() || !FormData?.isDataChanged()}
          >
            Update
          </Button>
        )}
        <Button
          size={'sm'}
          variant="secondary"
          onClick={() => FormData?.revert()}
          disabled={!FormData?.isDataChanged()}
        >
          Revert
        </Button>
      </Col>
      <Col style={{textAlign: 'end'}} className={'ps-0'}>
        <Button
          size={'sm'}
          variant="danger"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          Delete
        </Button>
      </Col>
    </Row>
    <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)} style={{zIndex: 2020}}>
      <Modal.Header><h5>Delete Page</h5></Modal.Header>
      <Modal.Body>Are you sure you want to delete this page? This action can't be undone.</Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
        <Button size="sm" variant="danger" onClick={() => {
          setShowDeleteConfirmation(false);
          onDelete();
        }}>Delete</Button>
      </Modal.Footer>
    </Modal>
  </>);
}