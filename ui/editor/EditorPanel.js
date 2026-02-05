import {Button, Col, Collapse, Row} from "react-bootstrap";
import {useState} from "react";
import {useEdit} from "./EditProvider";
import {useFormEditor} from "./FormEditor";
import {BsChevronCompactDown, BsChevronCompactUp, BsXLg} from "react-icons/bs";

export const Direction = {
  /** slide up */
  UP: 'up',
  /** slide down */
  DOWN: 'down',
}

/**
 * @typedef PanelAPI
 * @property {boolean} isExpanded
 */

/**
 * Display a collapsable editing panel
 *
 * @param onUpdate {function()}         Callback when Update button is clicked.
 * @param onDelete {function()}         Callback when Delete button is clicked.
 * @param isDataValid {function()}      Callback to check if data is valid.
 * @param [extraButtons] {JSX.Element}  Extra buttons for the bottom of the panel.
 * @param [hideButtons] {boolean}       Hide the built-in panel buttons for Update and Revert
 * @param [hideCloseBox] {boolean}      Hide the close box
 * @param children {[JSX.Element]}      Child elements, i.e. Rows and Cols and form controls.
 * @param [buttonRef] {Ref<HTMLButtonElement>}       Reference to the collapse/expand button.
 * @param [ref] {Ref<PanelAPI>}         Reference to functions.
 * @param [direction] {String}          Direction that
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
    hideButtons = false,
    hideCloseBox = false,
    direction = Direction.DOWN,
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
    className={`Editor EditorPanel ${expanded ? 'expanded' : 'collapsed'}`}
    style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      position: 'relative',
      minHeight: '20px',
    }}>

    <Collapse
      in={expanded}
      dimension={'height'}
      className={'Editor'}
    >
      <div
        style={{
          position: 'relative',
        }}
        className={`Editor EditorPanel Body ${expanded ? 'expanded' : 'collapsed'}`}
      >
        {!hideCloseBox && (
          <BsXLg
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              fontSize: '14pt',
              cursor: 'pointer',
            }}
            onClick={() => {
              setExpanded(false)
            }}
          />
        )}
        {children}
        {!hideButtons && (
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
        )}
      </div>
    </Collapse>
    <div
      className={`Editor EditorPanel Header ${expanded ? 'expanded' : 'collapsed'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
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
        {expanded ? (<>
          {direction === Direction.DOWN ? (
            <BsChevronCompactUp size={'25'}/>
          ) : (
            <BsChevronCompactDown size={'25'}/>
          )}
        </>) : (<>
          {direction === Direction.DOWN ? (
            <BsChevronCompactDown size={'25'}/>
          ) : (
            <BsChevronCompactUp size={'25'}/>
          )
          }
        </>)}
      </Button>
    </div>
  </div>);
}