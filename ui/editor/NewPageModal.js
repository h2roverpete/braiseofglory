import {useNavigate} from "react-router";
import {usePageContext} from "../content/Page";
import React, {useEffect, useState} from "react";
import {useSiteContext} from "../content/Site";
import {useRestApi} from "../../api/RestApi";
import {useFormEditor} from "./FormEditor";
import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import {useEdit} from "./EditProvider";

/**
 * Show modal dialog to create a new page
 * @param show {boolean}
 * @param setShow {function({boolean})}
 * @returns {Element}
 * @constructor
 */
export default function NewPageModal({show, setShow}) {

  const {canEdit} = useEdit();
  const {siteData, Outline, outlineData} = useSiteContext();
  const {pageData} = usePageContext();
  const {Pages, PageSections} = useRestApi();
  const navigate = useNavigate();
  const {edits, FormData} = useFormEditor();
  const [routes, setRoutes] = useState([]);
  useEffect(() => {
    if (canEdit && outlineData && pageData) {
      const routeList = [];
      for (const page of outlineData) {
        if (page.PageID !== pageData.PageID) {
          routeList.push(page.PageRoute);
        }
      }
      console.debug(`Loaded route list: ${JSON.stringify(routeList)}`);
      setRoutes(routeList);
    }
  }, [outlineData, pageData, canEdit]);

  if (!canEdit) {
    return <></>;
  }

  function isDataValid() {
    return isValidTitle(edits.PageTitle) && isValidRoute(edits.PageRoute);
  }

  function isValidTitle(title) {
    return title && title.match[/[a-zA-Z]/] !== null;
  }

  function isValidRoute(route) {
    return route && route.match(/^\/[a-z0-9]+$/) !== null && !routes.includes(route);
  }

  function insertNewPage() {
    console.debug(`Insert new page...`);
    Pages.insertOrUpdatePage({
      SiteID: siteData.SiteID,
      ParentID: 0,
      PageTitle: edits.PageTitle,
      NavTitle: edits.PageTitle,
      PageRoute: edits.PageRoute,
      PageHidden: edits.PageHidden,
    })
      .then((result) => {
        console.debug(`Page inserted.`);
        PageSections.insertOrUpdatePageSection({
          PageID: result.PageID,
          ParentID: 0
        }).then((result) => {
          console.debug(`Page section inserted.`);
          setShow?.(false);
          FormData.revert();
          Outline.addPage(result);
          navigate(result.PageRoute);
        }).catch(e => console.error(`Error inserting new page section.`, e));
      }).catch(e => console.error(`Error inserting new page.`, e));
  }

  function onCancel() {
    FormData.revert();
    setShow?.(false);
  }

  return (
    <Modal
      show={show}
      onHide={onCancel}
      className={'Editor'}
    >
      <Modal.Header><h5>New Page</h5></Modal.Header>
      <Modal.Body>
        <Row>
          <Form.Label
            htmlFor={'PageTitle'}
            column={'sm'}
            sm={2}
            className={'required'}
          >
            Title
          </Form.Label>
          <Col>
            <Form.Control
              size={'sm'}
              isValid={FormData.isTouched('PageTitle') && edits.PageTitle.length > 0}
              isInvalid={FormData.isTouched('PageTitle') && edits.PageTitle.length === 0}
              id={'PageTitle'}
              name={'PageTitle'}
              value={edits.PageTitle || ''}
              placeholder={'Title'}
              onChange={(e) => {
                FormData.onDataChanged({name: 'PageTitle', value: e.target.value})
              }}
            />
          </Col>
        </Row>
        <Row className={'mt-2'}>
          <Form.Label
            htmlFor={'PageRoute'}
            column={'sm'}
            sm={2}
            className={`required`}
          >
            Route
          </Form.Label>
          <Col>
            <Form.Control
              size={'sm'}
              isValid={FormData.isTouched('PageRoute') && isValidRoute(edits.PageRoute)}
              isInvalid={FormData.isTouched('PageRoute') && !isValidRoute(edits.PageRoute)}
              id={'PageRoute'}
              name={'PageRoute'}
              placeholder={'/page'}
              type="text"
              value={edits.PageRoute || ''}
              onChange={(e) => {
                FormData.onDataChanged({name: 'PageRoute', value: e.target.value})
              }}
            />
          </Col>
        </Row>
        <Row>
          <Form.Label
            column={'sm'}
            sm={2}
            htmlFor='PageHidden'
          />
          <Col>
            <Form.Check
              className={'form-control-sm'}
              id={'PageHidden'}
              label={'Hide page from site navigation'}
              checked={edits.PageHidden === true}
              onChange={(e) => {
                FormData.onDataChanged({name: 'PageHidden', value: e.target.checked})
              }}
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button
          size={'sm'}
          variant={"secondary"}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size={'sm'}
          variant="primary"
          disabled={!isDataValid()}
          onClick={insertNewPage}
        >
          Create New Page
        </Button>
      </Modal.Footer>
    </Modal>
  );
}