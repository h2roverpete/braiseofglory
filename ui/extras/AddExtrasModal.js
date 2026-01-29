import EmailField, {isValidEmail} from "../forms/EmailField";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {usePageContext} from "../content/Page";
import {useEffect, useState} from "react";
import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import {useEdit} from "../editor/EditProvider";
import {useFormEditor} from "../editor/FormEditor";

/**
 * @callback Callback
 * Callback function with no params.
 */

/**
 * Modal dialog for adding content extras.
 *
 * @param show    {Boolean}
 * @param onHide  {function()}
 * @param onSubmit {function()}
 * @param pageSectionId {Number}
 * @returns {JSX.Element}
 * @constructor
 */
export default function AddExtrasModal({show, onHide, onSubmit, pageSectionId}) {

  const {siteData} = useSiteContext();
  const {pageData, addExtraToPage} = usePageContext();
  const {GuestBooks, Galleries, Extras} = useRestApi();
  const {canEdit} = useEdit();

  const {edits, FormData} = useFormEditor();

  // lists of existing extras
  const [guestBookList, setGuestBookList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);

  useEffect(() => {
    if (canEdit) {
      // load list of existing galleries
      Galleries.getGalleries().then((result) => {
        console.debug(`List of ${result.length} galleries loaded.`);
        setGalleryList(result);
      }).catch((err) => {
        console.error(`Error getting gallery list.`, err);
      })
    }
  }, [Galleries, canEdit]);

  useEffect(() => {
    if (canEdit) {
      // load list of existing guest books
      GuestBooks.getGuestBooks().then((result) => {
        console.debug(`List of ${result.length} guest books loaded.`);
        setGuestBookList(result);
      }).catch((err) => {
        console.error(`Error getting guest book list.`, err);
      })
    }
  }, [GuestBooks, canEdit]);

  if (!canEdit) {
    return <></>;
  }

  function onAddExtra() {
    switch (edits.ExtraType) {
      case 'gallery':
        if (edits.GalleryID) {
          console.debug(`Adding gallery extra.`);
          Extras.insertOrUpdateExtra({
            ExtraType: edits.ExtraType,
            SiteID: siteData.SiteID,
            PageID: pageData.PageID,
            PageSectionID: pageSectionId,
            GalleryID: edits.GalleryID
          }).then((extra) => {
            console.debug(`Extra added.`);
            onExtraAdded(extra);
          }).catch((err) => {
            console.error(`Error adding extra.`, err);
          });
        } else {
          Galleries.insertOrUpdateGallery({
            SiteID: siteData.SiteID,
            GalleryName: siteData.SiteName
          }).then((result) => {
            console.debug(`Gallery added.`);
            Extras.insertOrUpdateExtra({
              ExtraType: edits.ExtraType,
              SiteID: siteData.SiteID,
              PageID: pageData.PageID,
              PageSectionID: pageSectionId,
              GalleryID: result.GalleryID
            }).then((extra) => {
              console.debug(`Extra added.`);
              onExtraAdded(extra);
            }).catch((err) => {
              console.error(`Error adding extra.`, err);
            });
          }).catch((err) => {
            console.error(`Error adding gallery.`, err);
          });
        }
        break;
      case 'guestbook':
        if (!edits.GuestBookID) {
          GuestBooks.insertOrUpdateGuestBook({
            GuestBookName: edits.GuestBookName,
            GuestBookEmail: edits.GuestBookEmail,
            SiteID: siteData.SiteID,
            ShowName: true,
            ShowEmail: true,
            ShowPhone: true,
            ShowFeedback: true
          }).then((result) => {
            console.debug(`Guest book added.`);
            Extras.insertOrUpdateExtra({
              ExtraType: edits.ExtraType,
              SiteID: siteData.SiteID,
              PageID: pageData.PageID,
              PageSectionID: pageSectionId,
              GuestBookID: result.GuestBookID
            }).then((extra) => {
              console.debug(`Extra added.`);
              onExtraAdded(extra);
            }).catch((err) => {
              console.error(`Error adding extra.`, err);
            });
          }).catch((error) => {
            console.error(`Error adding guest book.`, error);
          })
        } else {
          // create an Extra for an existing guest book
          Extras.insertOrUpdateExtra({
            ExtraType: edits.ExtraType,
            SiteID: siteData.SiteID,
            PageID: pageData.PageID,
            PageSectionID: pageSectionId,
            GuestBookID: edits.GuestBookID
          }).then((extra) => {
            console.debug(`Extra added.`);
            onExtraAdded(extra);
          }).catch((err) => {
            console.error(`Error adding extra.`, err);
          });
        }
        break;
      case 'instagram':
        console.debug(`Adding Instagram extra.`);
        Extras.insertOrUpdateExtra({
          ExtraType: edits.ExtraType,
          SiteID: siteData.SiteID,
          PageID: pageData.PageID,
          PageSectionID: pageSectionId,
          InstagramHandle: edits.InstagramHandle
        }).then((extra) => {
          console.debug(`Extra added.`);
          onExtraAdded(extra);
        }).catch((err) => console.error(`Error adding instagram.`, err));
        break;
      case 'file':
        console.debug(`Adding File extra.`);
        Extras.insertOrUpdateExtra({
          ExtraType: edits.ExtraType,
          SiteID: siteData.SiteID,
          PageID: pageData.PageID,
          PageSectionID: pageSectionId,
          ExtraFile: edits.ExtraFile,
          ExtraFilePrompt: edits.ExtraFilePrompt,
        }).then((extra) => {
          console.debug(`Extra added.`);
          onExtraAdded(extra);
        }).catch((err) => console.error(`Error adding file.`, err));
        break;
      default:
        console.error(`Unsupported extra type ${edits.ExtraType}`)
    }
  }

  /**
   * Called after an Extra is successfully added.
   */
  function onExtraAdded(extra) {
    FormData.revert();
    addExtraToPage(extra);
    onHide?.();
    onSubmit?.();
  }

  function isDataValid() {
    switch (edits.ExtraType) {
      case 'guestbook':
        if (!edits.GuestBookID) {
          return isValidEmail(edits.GuestBookEmail) && edits.GuestBookName.length > 0;
        } else {
          return edits.GuestBookID > 0;
        }
      case 'gallery':
        return edits.GalleryID === undefined || edits.GalleryID > 0;
      case 'instagram':
        return isValidInstagramHandle(edits.InstagramHandle);
      case 'file':
        return edits.ExtraFile !== null
      default:
        return false;
    }
  }

  function isValidInstagramHandle(value) {
    return value && /^@[a-zA-Z0-9\-.]+$/.test(value);
  }

  function onCancel() {
    FormData.revert();
    onHide?.();
  }

  const labelCols = 4;

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header><h5>Add an Extra</h5></Modal.Header>
      <Modal.Body>
        <Row>
          <Form.Label
            className='required'
            column={'sm'}
            htmlFor={'ExtraType'}
            sm={labelCols}
          >
            Extra Type
          </Form.Label>
          <Col>
            <Form.Select
              id="ExtraType"
              size={'sm'}
              value={edits.ExtraType}
              onChange={(e) => FormData.onDataChanged({name: 'ExtraType', value: e.target.value})}
            >
              <option value={''}>(Select)</option>
              <option value='gallery'>Photo Gallery</option>
              <option value='guestbook'>Guest Book</option>
              <option value='instagram'>Instagram Gallery</option>
              <option value='file'>File</option>
            </Form.Select>
          </Col>
        </Row>
        {edits.ExtraType === 'guestbook' && (<>
          <Row className="mt-2">
            <Col sm={labelCols}></Col>
            <Col>
              <Form.Check
                type='radio'
                name={'NewGuestBook'}
                className='form-control-sm'
                label='Create new guest book'
                checked={edits.GuestBookID === undefined}
                onChange={() => {
                  FormData.onDataChanged({name: 'GuestBookID', value: undefined});
                }}
              />
              <Form.Check
                type='radio'
                name={'NewGuestBook'}
                value={'true'}
                className='form-control-sm'
                label='Use existing guest book'
                checked={edits.GuestBookID !== undefined}
                onChange={() => {
                  FormData.onDataChanged({name: 'GuestBookID', value: 0});
                }}
              />
            </Col>
          </Row>
          {edits.GuestBookID === undefined ? (<>
            <Row className="mt-2">
              <Form.Label className='required' column={'sm'} htmlFor={'GuestBookName'} sm={labelCols}>
                Title for Emails</Form.Label>
              <Col>
                <Form.Control
                  id="GuestBookName"
                  name="GuestBookEmail"
                  size="sm"
                  isValid={FormData.isTouched('GuestBookName') && edits.GuestBookName.length > 0}
                  isInvalid={FormData.isTouched('GuestBookName') && edits.GuestBookName.length === 0}
                  onChange={(e) => FormData.onDataChanged({name: 'GuestBookName', value: e.target.value})}
                  value={edits.GuestBookName || ''}
                />
              </Col>
            </Row>
            <Row className="mt-2">
              <Form.Label className='required' column={'sm'} htmlFor={'GuestBookEmail'} sm={labelCols}>Admin
                Email</Form.Label>
              <Col>
                <EmailField
                  id="GuestBookEmail"
                  name="GuestBookEmail"
                  size="sm"
                  onChange={(e) => FormData.onDataChanged({name: 'GuestBookEmail', value: e.target.value})}
                  value={edits.GuestBookEmail}
                />
              </Col>
            </Row>
          </>) : (<>
            <Row className="mt-2">
              <Form.Label
                className='required'
                column={'sm'}
                htmlFor={'GuestBook'}
                sm={labelCols}
              >Guest Book
              </Form.Label>
              <Col>
                <Form.Select
                  id="GuestBook"
                  name="GuestBookEmail"
                  size="sm"
                  onChange={(e) => FormData.onDataChanged({name: 'GuestBookID', value: parseInt(e.target.value)})}
                  value={edits.GuestBookID}
                >
                  <option key={''} value={0}>(Select a guest book)</option>
                  {guestBookList.map((guestBook) => (
                    <option key={guestBook.GuestBookID} value={guestBook.GuestBookID}>{guestBook.GuestBookName}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </>)}
        </>)}
        {edits.ExtraType === 'gallery' && (<>
          <Row className="mt-2">
            <Col sm={labelCols}></Col>
            <Col>
              <Form.Check
                type='radio'
                name={'NewGallery'}
                className='form-control-sm'
                label='Create new gallery'
                checked={edits.GalleryID === undefined}
                onChange={() => {
                  FormData.onDataChanged({name: 'GalleryID', value: undefined});
                }}
              />
              <Form.Check
                type='radio'
                name={'NewGallery'}
                value={'true'}
                className='form-control-sm'
                label='Use existing gallery'
                checked={edits.GalleryID !== undefined}
                onChange={() => {
                  FormData.onDataChanged({name: 'GalleryID', value: 0});
                }}
              />
            </Col>
          </Row>
          {edits.GalleryID !== undefined && (
            <Row className="mt-2">
              <Form.Label
                className='required'
                column={'sm'}
                htmlFor={'Gallery'}
                sm={labelCols}
              >Gallery
              </Form.Label>
              <Col>
                <Form.Select
                  id="Gallery"
                  size="sm"
                  onChange={(e) => FormData.onDataChanged({name: 'GalleryID', value: parseInt(e.target.value)})}
                  value={edits.GalleryID}
                >
                  <option key={''} value={0}>(Select a gallery)</option>
                  {galleryList.map((gallery) => (
                    <option key={gallery.GalleryID} value={gallery.GalleryID}>{gallery.GalleryName}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          )}
        </>)}
        {edits.ExtraType === 'instagram' && (
          <Row className="mt-2">
            <Form.Label
              className='required'
              column={'sm'}
              htmlFor={'InstagramHandle'}
              sm={labelCols}
            >
              Instagram Handle
            </Form.Label>
            <Col>
              <Form.Control
                id="InstagramHandle"
                name="InstagramHandle"
                size="sm"
                placeholder="@myhandle"
                isValid={edits.InstagramHandle && isValidInstagramHandle(edits.InstagramHandle)}
                isInvalid={edits.InstagramHandle && !isValidInstagramHandle(edits.InstagramHandle)}
                onChange={(e) => FormData.onDataChanged({name: 'InstagramHandle', value: e.target.value})}
                value={edits.InstagramHandle || ''}
              />
            </Col>
          </Row>
        )}
        {edits.ExtraType === 'file' && (<>
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
                onChange={(e) => FormData.onDataChanged({name: 'ExtraFile', value: e.target.files[0]})}
              />
            </Col>
          </Row>
          <Row
            className="mt-2"
            hidden={!edits.ExtraFile || edits.ExtraFile.type?.startsWith('text/')}
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
                size="sm"
                onChange={(e) => FormData.onDataChanged({name: 'ExtraFilePrompt', value: e.target.value})}
              />
            </Col>
          </Row>
        </>)}
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button
          size="sm"
          variant="primary"
          disabled={!isDataValid()}
          onClick={() => {
            onAddExtra();
          }}
        >Add Extra</Button>
      </Modal.Footer>
    </Modal>
  );

}