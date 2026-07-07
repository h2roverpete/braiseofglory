import {useFormData} from "../editor/FormEditor";
import {useEffect, useState} from "react";
import {Button, Col, Form, Row} from "react-bootstrap";
import {useRestApi} from "../../api/RestApi"
import {useSiteContext} from "../content/Site";


/**
 * Display message that the user doesn't have permission to view the content.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsCampaignFields({smsCampaignId}) {

  const [smsCampaignConfig, setSmsCampaignConfig] = useState();
  const {SMS, Sites} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const formData = useFormData();
  const [sites, setSites] = useState();

  useEffect(() => {
    if (!smsCampaignConfig) {
      SMS.getSmsCampaign(smsCampaignId).then((response) => {
        formData.setData(response);
      }).catch((error) => showErrorAlert(error));
    }
  });

  useEffect(() => {
    if (!sites) {
      Sites.getSites().then((response) => {
        setSites(response);
      }).catch((error) => showErrorAlert(error));
    }
  })

  const labelCols = 3;
  return <div className="container-fluid">
    <Row className={'mt-2'}>
      <Form.Label
        column={'sm'}
        sm={labelCols}
        className={'required'}
        htmlFor={'CampaignName'}
      >
        Name
      </Form.Label>
      <Col>
        <Form.Control
          size={'sm'}
          name={'CampaignName'}
          isValid={formData.isTouched('CampaignName') && formData.edits.CampaignName?.length > 0}
          isInvalid={formData.isTouched('CampaignName') && !(formData.edits.CampaignName?.length > 0)}
          value={formData.edits?.CampaignName || ''}
          onChange={(e) => formData.onDataChanged({name: 'CampaignName', value: e.target.value})}
        />
      </Col>
    </Row>

  </div>;
}