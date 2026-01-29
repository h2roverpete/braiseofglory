import {useEdit} from "./EditProvider";
import {Button, Col, Form, Modal, Row, Collapse} from "react-bootstrap";
import {useEffect, useRef, useState} from "react";
import {usePageContext} from "../content/Page";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {useNavigate} from "react-router";
import {useFormEditor} from "./FormEditor";
import {BsChevronDown, BsChevronUp} from "react-icons/bs";

/**
 * Edit page metadata fields.
 * @returns {JSX.Element}
 * @constructor
 */
export default function PageConfig() {

  const {Pages} = useRestApi();
  const {canEdit} = useEdit();
  const {pageData, setPageData, addPageSection} = usePageContext();
  const {Outline, outlineData} = useSiteContext()
  const [expanded, setExpanded] = useState(false);

  const {edits, FormData} = useFormEditor();
  useEffect(() => {
    FormData.update(pageData);
  }, [pageData])

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const navigate = useNavigate();

  const buttonRef = useRef(null);
  const [routes, setRoutes] = useState([]);
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

  if (!canEdit) {
    return <></>;
  }

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
    collapsePanel();
  }

  function onDelete() {
    console.debug(`Deleting page...`);
    Pages.deletePage(pageData.PageID)
      .then(() => {
        console.debug(`Deleted page.`);
        Outline.deletePage(pageData.PageID);
        navigate('/');
        collapsePanel();
      })
      .catch(e => console.error(`Error deleting page.`, e));
  }

  function isValidRoute(route) {
    return route?.match(/^\/[a-z0-9]+/) && !routes.includes(route);
  }

  function collapsePanel() {
    buttonRef.current?.click();
  }

  return (<div
    className="PageEditor Editor dropleft"
    style={{
    position: 'absolute',
    top: 0,
    left: 0,
  }}>
    <Button
      variant=""
      onClick={() => setExpanded(!expanded)}
      className={`EditorToggle ${expanded ? '' : 'collapsed'}`}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '5px 21px 0 0',
        width: '100vw',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'end',
        position: 'fixed',
        zIndex: '1034'
      }}
    >
      {expanded ? (<BsChevronUp size={'20'}/>) : ((<BsChevronDown size={'20'}/>))}
    </Button>

    <Collapse
      in={expanded}
      dimension={'height'}
      className={'Editor'}
    >
      <div style={{
        backgroundColor: '#e0e0e0f0',
        position: 'fixed',
        left: '0px',
        zIndex: '1033',
        borderBottom: '1px solid #00000040',
      }}>
        <div style={{
          width: '100vw',
          padding: '10px 10px 20px 10px',
          display: 'flex',
          flexDirection: 'column',
        }}>
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
                className={'form-control-sm mt-2'}
                checked={edits?.PageHidden || false}
                id={'PageHidden'}
                label={'Hide page from site navigation'}
                onChange={(e) => FormData?.onDataChanged({name: 'PageHidden', value: e.target.checked})}
              />
            </Col>
          </Row>
          <Row className={'mt-4'}>
            <Col xs={'auto'} className={'pe-0'}>
              {onUpdate && isDataValid && (
                <Button
                  className="me-2"
                  size={'sm'}
                  variant="primary"
                  onClick={() => {
                    setExpanded(false);
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
                className="me-2"
                variant="secondary"
                onClick={addPageSection}
              >
                Add Section
              </Button>
              <Button
                size={'sm'}
                variant="danger"
                onClick={onDelete}
              >
                Delete
              </Button>
            </Col>
          </Row>
        </div>
      </div>
    </Collapse>
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
  </div>);
}