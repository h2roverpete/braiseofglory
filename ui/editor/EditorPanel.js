import {Accordion, AccordionButton, Button, Col, Row} from "react-bootstrap";
import {useState} from "react";
import {useEdit} from "./EditProvider";
import {useFormEditor} from "./FormEditor";

/**
 * Display a collapsable editing panel
 *
 * @param onUpdate {function()}    Callback when Update button is clicked.
 * @param onDelete {function()}    Callback when Delete button is clicked.
 * @param isDataValid {function()}          Callback to check if data is valid.
 * @param [extraButtons] {JSX.Element}    Extra buttons for the bottom of the panel.
 * @param children {[JSX.Element]}        Child elements, i.e. Rows and Cols and form controls.
 * @param [position] {String}             Position attribute for the panel, i.e. 'fixed' or 'relative'
 * @param [buttonStyle] {Object}          Additional styles for the collapse/expand button.
 * @param [buttonRef] {RefObject}         Reference to the collapse/expand button.
 * @param [panelStyle] {Object}           Additional styles for the panel container.
 * @param [bodyStyle] {Object}            Additional styles for the panel body.
 * @returns {JSX.Element}
 * @constructor
 */
export default function EditorPanel(
  {
    onUpdate,
    onDelete,
    isDataValid,
    children,
    position,
    buttonStyle,
    buttonRef,
    panelStyle,
    bodyStyle,
    extraButtons
  }
) {
  const {FormData} = useFormEditor();

  const [activeKey, setActiveKey] = useState('');

  const {canEdit} = useEdit();
  if (!canEdit) {
    return <></>
  }
  return (
    <Accordion
      activeKey={activeKey}
      style={{width: '100%'}}
      className={'Editor'}
    >
      <Accordion.Item
        style={{
          width: "100%",
          position: position ? position : 'relative',
          background: 'transparent',
          border: 'none',
          ...panelStyle,
        }}
        eventKey={'config'}
      >
        <AccordionButton
          style={{
            padding: '0 8px 0 0',
            top: '0',
            left: '0',
            background: 'transparent',
            boxShadow: 'none',
            ...buttonStyle,
          }}
          ref={buttonRef}
          className="EditorToggle"
          onClick={() => setActiveKey(activeKey === 'config' ? '' : 'config')}
        />
        <Accordion.Body
          style={{
            background: '#e0e0e0f0',
            marginBottom: '20px',
            ...bodyStyle,
          }}
        >
          {children}
          <Row className={'mt-4'}>
            <Col xs={'auto'} className={'pe-0'}>
              {onUpdate && isDataValid && (
                <Button
                  className="me-2"
                  size={'sm'}
                  variant="primary"
                  onClick={()=>{
                    setActiveKey('');
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
              {extraButtons}
              {onDelete && (
                <Button
                  size={'sm'}
                  variant="danger"
                  onClick={onDelete}
                >
                  Delete
                </Button>
              )}
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  )
}