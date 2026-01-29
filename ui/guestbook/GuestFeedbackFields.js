import LodgingFields from "./LodgingFields";
import CustomFields from "./CustomFields";
import {Col, Form, Row} from "react-bootstrap";

/**
 * Fields for entering guest feedback.
 *
 * @param guestBookConfig {GuestBookConfig}
 * @param guestFeedbackData {GuestFeedbackData}
 * @param onChange {DataCallback}
 * @param labelCols {Number}
 * @returns {JSX.Element}
 * @constructor
 */
function GuestFeedbackFields({guestBookConfig, guestFeedbackData, onChange, labelCols}) {
  return (<>
    {guestBookConfig.ShowLodgingFields && (
      <LodgingFields lodgingData={guestFeedbackData} onChange={onChange} labelCols={labelCols}/>
    )}
    <CustomFields
      guestBookConfig={guestBookConfig}
      feedbackData={guestFeedbackData}
      onChange={onChange}
      labelCols={labelCols}
    />
    {guestBookConfig.ShowFeedback && (
      <Row className={'mt-2'}>
        <Col>
          <Form.Label
            htmlFor="FeedbackText"
            column={true}
          >
            {guestBookConfig.TextCaption ? guestBookConfig.TextCaption : 'Questions or Comments'}
          </Form.Label>
          <Form.Control
            as="textarea"
            name="FeedbackText"
            id="FeedbackText"
            rows={5}
            value={guestFeedbackData.FeedbackText}
            onChange={e => {
              onChange({
                name: 'FeedbackText',
                value: e.target.value
              })
            }}
          />
        </Col>
      </Row>
    )}
  < />)
}

export default GuestFeedbackFields;