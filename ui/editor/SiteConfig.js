import {useSiteContext} from "../content/Site";
import {Col, Form, Row, Button} from "react-bootstrap";
import {useRestApi} from "../../api/RestApi";
import {useFormData} from "./FormEditor";
import {useEffect} from "react";

export default function SiteConfig(props) {

  const {siteData, setSiteData} = useSiteContext();
  const {Sites} = useRestApi();

  /** @type FormDataAPI<SiteData> */
  const formData = useFormData();

  useEffect(() => {
    formData.setData(siteData);
  }, [siteData, formData]);

  function onSubmit() {
    console.debug(`Updating site properties...`);
    Sites.insertOrUpdateSite(formData.edits).then((result) => {
      console.debug(`Site properties updated.`);
      formData.update(result);
      setSiteData(result);
    }).catch((err) => {
      console.error(`Error updating site properties.`, err);
    })
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
      <div {...props}>
        <h5 className={''}>Site Properties</h5>
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
        <Row className="mt-2">
          <Col>
            <Button
              size={'sm'}
              variant={'primary'}
              className={'me-2'}
              onClick={onSubmit}
              disabled={!formData.isDataChanged() || !isDataValid()}
            >
              Update</Button>
            <Button
              size={'sm'}
              variant={'secondary'}
              disabled={!formData.isDataChanged()}
              onClick={() => formData.revert()}
            >
              Revert</Button>
          </Col>
        </Row>
      </div>
    )}
  </>)
}