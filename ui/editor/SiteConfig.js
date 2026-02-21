import {useSiteContext} from "../content/Site";
import {Col, Form, Row, Button} from "react-bootstrap";
import {useRestApi} from "../../api/RestApi";
import {useFormData} from "./FormEditor";
import {useEffect} from "react";

/**
 * @typedef SiteConfigProps
 *
 * @property {SiteData} [siteData]              Site data to use instead of SiteContext.siteData
 * @property {function(SiteData)} [onUpdate]    Receive callback on data update.
 * @property {function(SiteData)} [onDelete]    Show delete button and receive callback on delete.
 * @property {function()} [onCancel]            Show cancel button and receive callback on cancel.
 * @property {string} [className]               Class name(s) for container <div>
 * @property {Object} [style]                   Style for container <div>
 */

/**
 * Site configuration fields & database updates.
 *
 * @param props {SiteConfigProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function SiteConfig(props) {

  // imports
  const {siteData, setSiteData, showErrorAlert} = useSiteContext();
  const {Sites} = useRestApi();

  /** @type FormDataAPI<SiteData> */
  const formData = useFormData();

  useEffect(() => {
    if (props.siteData) {
      // use provided site from props
      formData.setData(props.siteData);
    } else if (siteData) {
      // get site from context
      formData.setData(siteData);
    }
  }, [siteData, formData, props.siteData]);

  function onUpdate() {
    console.debug(`Updating site properties...`);
    Sites.insertOrUpdateSite(formData.edits).then((result) => {
      console.debug(`Site updated.`);
      formData.update(result);
      if (!props.siteData) {
        // update if we are getting data from site context
        setSiteData(result);
      }
      props.onUpdate?.(result);
    }).catch((err) => {
      console.error(`Error updating site properties.`, err);
    })
  }

  function onDelete() {
    Sites.deleteSite(formData.edits.SiteID)
      .then(result => {
        props.onDelete?.(result);
      })
      .catch((err) => {
        showErrorAlert(err);
      });
  }

  function isDataValid() {
    return formData.edits?.SiteName?.length > 0
      && isValidUrl(formData.edits?.SiteRootUrl)
      && isValidBucket(formData.edits?.SiteBucketName)
  }

  function isValidUrl(url) {
    return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url);
  }

  function isValidBucket(bucketName) {
    return bucketName && /[a-z.]*/.test(bucketName);
  }

  return (<>
    {siteData && (
      <div
        className={`SiteConfig ${props.className ? props.className : ''}`}
        style={props.style}
      >
        <h5>Site Properties</h5>
        <Row>
          <Col>
            <Form.Label column={'sm'} className={'required'} htmlFor={'SiteName'}>Site Name</Form.Label>
            <Form.Control
              size={'sm'}
              id={'SiteName'}
              isValid={formData.isTouched('SiteName') && formData.edits?.SiteName?.length > 0}
              isInvalid={formData.isTouched('SiteName') && !formData.edits?.SiteName}
              value={formData.edits?.SiteName || ''}
              onChange={(e) => formData.onDataChanged({name: 'SiteName', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Label column={'sm'} className={'required'} htmlFor={'SiteRootUrl'}>URL</Form.Label>
            <Form.Control
              size={'sm'}
              id={'SiteRootUrl'}
              isValid={formData.isTouched('SiteRootUrl') && isValidUrl(formData.edits?.SiteRootUrl)}
              isInvalid={formData.isTouched('SiteRootUrl') && !isValidUrl(formData.edits?.SiteRootUrl)}
              value={formData.edits?.SiteRootUrl || ''}
              onChange={(e) => formData.onDataChanged({name: 'SiteRootUrl', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Label column={'sm'} htmlFor={'SiteTheme'}>Theme</Form.Label>
            <Form.Select
              size={'sm'}
              id={'SiteTheme'}
              value={formData.edits?.SiteTheme || ''}
              onChange={(e) => formData.onDataChanged({name: 'SiteTheme', value: e.target.value})}
            >
              <option value={``}>none</option>
              <option value={`light`}>Bootstrap-Light</option>
              <option value={`dark`}>Bootstrap-Dark</option>
            </Form.Select>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Label column={'sm'} className={'required'} htmlFor={'SiteBucketName'}>S3 Bucket</Form.Label>
            <Form.Control
              size={'sm'}
              id={'SiteBucketName'}
              isValid={formData.isTouched('SiteRootUrl') && isValidBucket(formData.edits?.SiteBucketName)}
              isInvalid={formData.isTouched('SiteRootUrl') && !isValidBucket(formData.edits?.SiteBucketName)}
              value={formData.edits?.SiteBucketName || ''}
              onChange={(e) => formData.onDataChanged({name: 'SiteBucketName', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Label column={'sm'} className={''} htmlFor={'GoogleClientID'}>Google Client ID</Form.Label>
            <Form.Control
              size={'sm'}
              id={'GoogleClientID'}
              placeholder={'G-XXXXXXXXXX'}
              value={formData.edits?.GoogleClientID || ''}
              onChange={(e) => formData.onDataChanged({name: 'GoogleClientID', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <Button
              size={'sm'}
              variant={'primary'}
              className={'me-2'}
              onClick={onUpdate}
              disabled={!formData.isDataChanged() || !isDataValid()}
            >
              {formData.edits.SiteID ? 'Update' : 'Add'}</Button>
            <Button
              size={'sm'}
              variant={'secondary'}
              disabled={!formData.isDataChanged()}
              onClick={() => formData.revert()}
            >
              Revert</Button>
          </Col>
          {(props.onCancel || props.onDelete) && (
            <Col className={'text-end ps-0'}>
              {props.onCancel && (
                <Button
                  size={'sm'}
                  variant={'secondary'}
                  onClick={() => props.onCancel()}
                >
                  Cancel
                </Button>
              )}
              {props.onDelete && formData.edits.SiteID >= 0 && (
                <Button
                  className={'ms-2'}
                  size={'sm'}
                  variant={'danger'}
                  onClick={() => onDelete()}
                >
                  Delete
                </Button>
              )}
            </Col>
          )}
        </Row>
      </div>
    )}
  </>);
}