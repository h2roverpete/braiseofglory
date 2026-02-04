import {useSiteContext} from "../content/Site";
import {Col, Form, Row, Button} from "react-bootstrap";
import {useRestApi} from "../../api/RestApi";
import {useFormEditor} from "./FormEditor";
import {useEffect} from "react";

export default function SiteConfig(props) {

  const {siteData, setSiteData} = useSiteContext();
  const {Sites} = useRestApi();

  const {edits, FormData} = useFormEditor();
  useEffect(() => {
    FormData.update(siteData);
  },[siteData])

  function onSubmit() {
    console.debug(`Updating site properties...`);
    Sites.insertOrUpdateSite(edits).then((result) => {
      console.debug(`Site properties updated.`);
      FormData?.update(result);
      setSiteData(result);
    }).catch((err) => {
      console.error(`Error updating site properties.`, err);
    })
  }

  function isDataValid() {
    return edits?.SiteName?.length > 0
      && isValidUrl(edits?.SiteRootUrl)
      && isValidBucket(edits?.SiteBucketName)
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
              isValid={FormData?.isTouched('SiteName') && edits?.SiteName?.length > 0}
              isInvalid={FormData?.isTouched('SiteName') && !edits?.SiteName}
              value={edits?.SiteName || ''}
              onChange={(e) => FormData?.onDataChanged({name: 'SiteName', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Label column={'sm'} className={'required'} htmlFor={'SiteRootUrl'}>URL</Form.Label>
            <Form.Control
              size={'sm'}
              id={'SiteRootUrl'}
              isValid={FormData?.isTouched('SiteRootUrl') && isValidUrl(edits?.SiteRootUrl)}
              isInvalid={FormData?.isTouched('SiteRootUrl') && !isValidUrl(edits?.SiteRootUrl)}
              value={edits?.SiteRootUrl || ''}
              onChange={(e) => FormData?.onDataChanged({name: 'SiteRootUrl', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Label column={'sm'} className={'required'} htmlFor={'SiteBucketName'}>S3 Bucket</Form.Label>
            <Form.Control
              size={'sm'}
              id={'SiteBucketName'}
              isValid={FormData?.isTouched('SiteRootUrl') && isValidBucket(edits?.SiteBucketName)}
              isInvalid={FormData?.isTouched('SiteRootUrl') && !isValidBucket(edits?.SiteBucketName)}
              value={edits?.SiteBucketName || ''}
              onChange={(e) => FormData?.onDataChanged({name: 'SiteBucketName', value: e.target.value})}
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
              value={edits?.GoogleClientID || ''}
              onChange={(e) => FormData?.onDataChanged({name: 'GoogleClientID', value: e.target.value})}
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
              disabled={!FormData?.isDataChanged() || !isDataValid()}
            >
              Update</Button>
            <Button
              size={'sm'}
              variant={'secondary'}
              disabled={!FormData?.isDataChanged()}
              onClick={() => FormData?.revert()}
            >
              Revert</Button>
          </Col>
        </Row>
      </div>
    )}
  </>)
}