import {Button, Col, Collapse, Row} from "react-bootstrap";
import {useState} from "react";
import {useEdit} from "./EditProvider";
import {useFormEditor} from "./FormEditor";
import {BsChevronCompactDown, BsChevronCompactUp, BsXLg} from "react-icons/bs";

/**
 * Display a collapsable editing panel
 *
 * @param onUpdate {function()}    Callback when Update button is clicked.
 * @param onDelete {function()}    Callback when Delete button is clicked.
 * @param isDataValid {function()}          Callback to check if data is valid.
 * @param [extraButtons] {JSX.Element}    Extra buttons for the bottom of the panel.
 * @param children {[JSX.Element]}        Child elements, i.e. Rows and Cols and form controls.
 * @param [buttonRef] {RefObject}         Reference to the collapse/expand button.
 * @param [ref] {RefObject}         Reference to functions.
 * @returns {JSX.Element}
 * @constructor
 */
export default function EditorPanel(
  {
    onUpdate,
    onDelete,
    isDataValid,
    children,
    buttonRef,
    extraButtons,
    ref,
  }
) {
  const {FormData} = useFormEditor();
  const [expanded, setExpanded] = useState(false);
  const {canEdit} = useEdit();

  if (!canEdit) {
    return <></>
  }

  if (ref) {
    ref.current = {
      isExpanded: expanded,
    }
  }

  return (<div
    className={"EditorPanel Editor"}
    style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    }}>
    <div
      style={{
        height: '20px',
        backgroundColor: expanded ? '#e0e0e0f0' : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Button
        variant={''}
        ref={buttonRef}
        onClick={() => setExpanded(!expanded)}
        className={`EditorToggle horizontal ${expanded ? '' : 'collapsed'}`}
        style={{
          marginLeft: 0,
          borderRadius: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {expanded ? (<BsChevronCompactUp size={'25'}/>) : ((<BsChevronCompactDown size={'25'}/>))}
      </Button>
    </div>
    <Collapse
      in={expanded}
      dimension={'height'}
      className={'Editor'}
    >
      <div
        style={{
          backgroundColor: '#e0e0e0f0',
          width: '100%',
          padding: '0 10px 10px 10px',
          position: 'relative',
        }}
        className="EditorPanel Body"
      >
        <BsXLg
          style={{
            position: 'absolute',
            top: -5,
            right: 15,
            fontSize: '14pt',
            cursor: 'pointer',
          }}
          onClick={() => {
            setExpanded(false)
          }}
        />
        {children}
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
      </div>
    </Collapse>
  </div>);
}