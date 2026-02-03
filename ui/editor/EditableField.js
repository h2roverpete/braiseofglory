import {useCallback, useEffect, useRef, useState} from "react";
import EditButtons, {EditAction} from "./EditButtons";
import {useEdit} from "./EditProvider";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "react-bootstrap";
import AlignButtons, {AlignAction} from "./AlignButtons";

/**
 * @typedef EditCallbackData
 * @property {string} textContent
 * @property {string} textAlign
 */

/**
 * @callback EditCallback
 * @param {EditCallbackData|undefined}
 */

/**
 * @typedef EditableFieldProps
 *
 * @property {JSX.Element} field          Field to enhance with edit controls.
 * @property {ref} fieldRef               Reference to the editable element in the field contents.
 * @property {EditCallback} callback      Called when edits need to be committed.
 * @property {string} textContent         Initial text content (used for canceling/reverting)
 * @property {string} textAlign           Initial text alignment (used for canceling/reverting)
 * @property {boolean} [allowEnterKey]    Allow enter key in data entry (instead of committing changes)
 * @property {boolean} [showEditButton]   Show edit button?
 * @property {boolean} [editing]          Is the field currently being edited?
 * @property {boolean} [alwaysShow]       Always show the field, even if empty (reserves layout space)
 */

/**
 * HOC adds the ability to edit the content and alignment of text elements
 *
 * @param props {EditableFieldProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function EditableField(props) {

  const {canEdit} = useEdit();
  const [isEditing, setEditing] = useState(props.editing);
  const [savedPadding, setSavedPadding] = useState('0');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [originalContent, setOriginalContent] = useState(null);
  useEffect(() => {
    setOriginalContent(props.textContent);
  }, [props.textContent]);
  const [originalAlign, setOriginalAlign] = useState(null);
  useEffect(() => {
    setOriginalAlign(props.textAlign);
  }, [props.textAlign]);

  useEffect(() => {
    if (isEditing) {
      // focus when editing
      props.fieldRef.current.focus();
    }
  }, [props.fieldRef, isEditing]);

  function onKeyDown(evt) {
    // end editing and update on enter
    if (evt.key === 'Enter' && !props.allowEnterKey) {
      evt.preventDefault();
      commitEdits();
    }
    if (evt.key === 'Escape') {
      evt.preventDefault();
      cancelEditing();
    }
    if (evt.key === 'Tab') {
      if (
        props.fieldRef.current.innerText !== props.textContent
        || props.fieldRef.current.style.textAlign !== props.textAlign
      ) {
        // tab out after content has changed
        evt.preventDefault();
        // confirm changes
        setShowConfirmation(true);
      } else {
        // no change to content, just cancel
        cancelEditing();
      }
    }
  }

  const divRef = useRef(null);
  const startEditing = useCallback(() => {
    // enable pointer events if they were disabled for drag and drop
    props.fieldRef.current.style.pointerEvents = 'auto';
    props.fieldRef.current.style.whiteSpace = 'pre-wrap';
    setSavedPadding(props.fieldRef.current.style.padding);
    props.fieldRef.current.style.padding = '2px';
    // set editing flag
    setEditing(true);
    // transform text from display HTML to source
    props.fieldRef.current.innerText = props.fieldRef.current.innerHTML
  }, [props.fieldRef]);

  function cancelEditing() {
    // prevent field from blocking pointer events
    props.fieldRef.current.style.pointerEvents = 'none';
    props.fieldRef.current.style.whiteSpace = 'normal';
    props.fieldRef.current.style.padding = savedPadding;
    // revert title value and alignment
    props.fieldRef.current.innerHTML = originalContent ? originalContent : '';
    props.fieldRef.current.style.textAlign = originalAlign ? originalAlign : '';

    // hide confirmation
    if (showConfirmation) {
      setShowConfirmation(false);
    }
    // clear editing flag
    setEditing(false);
    // notify caller we canceled
    props.callback({textContent: null, textAlign: null});
  }

  function commitEdits() {
    console.debug(`Committing edits...`);
    props.callback({
      textContent: props.fieldRef.current.innerText,
      textAlign: props.fieldRef.current.style.textAlign,
    });

    // transform text from HTML source to display HTML
    props.fieldRef.current.innerHTML = props.fieldRef.current.innerText;
    props.fieldRef.current.style.pointerEvents = 'none';
    props.fieldRef.current.style.whiteSpace = 'normal';
    props.fieldRef.current.style.padding = savedPadding;
    setShowConfirmation(false);
    setEditing(false);
  }

  useEffect(() => {
    if (props.editing && !isEditing) {
      startEditing();
    }
  }, [props.editing, isEditing, startEditing]);

  function editCallback(action) {
    switch (action) {
      case EditAction.EDIT:
        startEditing();
        break;
      case EditAction.CONFIRM:
        commitEdits();
        break;
      case EditAction.CANCEL:
        cancelEditing();
        break;
      case AlignAction.ALIGN_LEFT:
        props.fieldRef.current.style.textAlign = 'left';
        break;
      case AlignAction.ALIGN_CENTER:
        props.fieldRef.current.style.textAlign = 'center';
        break;
      case AlignAction.ALIGN_RIGHT:
        props.fieldRef.current.style.textAlign = 'right';
        break;
      default:
        break;
    }
  }

  function onHideConfirmation() {
    // canceled by clicking outside
    cancelEditing();
  }

  // update field properties
  if (props.fieldRef.current) {
    props.fieldRef.current.style.paddingRight = `${isEditing ? '65px' : '0'}`
    props.fieldRef.current.contentEditable = isEditing === true;
    if (!isEditing) {
      // undo edit modifications to field
      props.fieldRef.current.classList.remove('border');
      props.fieldRef.current.classList.remove('rounded-2');
      props.fieldRef.current.onkeydown = undefined;
      if (!props.fieldRef.current.innerText) {
        props.fieldRef.current.style.minHeight = '39px';
      } else {
        delete props.fieldRef.current.style.minHeight;
      }
      props.fieldRef.current.style.pointerEvents = 'none';
    } else {
      // show border around editable item while editing
      props.fieldRef.current.classList.add('border');
      props.fieldRef.current.classList.add('rounded-2');
      props.fieldRef.current.onkeydown = (evt) => onKeyDown(evt);
      props.fieldRef.current.style.minHeight = '39px';
      props.fieldRef.current.style.verticalAlign = 'middle';
      props.fieldRef.current.style.pointerEvents = 'auto';
    }
  }

  return (
    <>{canEdit ? (
      <>
        <div
          style={{
            position: 'relative',
            width: '100%',
            pointerEvents: isEditing || props.showEditButton ? 'auto' : 'none',
          }}
          ref={divRef}
        >
          {isEditing ? (<>
            {props.field}
          </>) : (<>
            {props.field}
          </>)}

          <AlignButtons
            callback={editCallback}
            editable={canEdit}
            editing={isEditing}
            align={props.fieldRef.current?.style.textAlign}
            style={{position: 'absolute', top: '-20px', left: '40%'}}
          />
          <EditButtons
            callback={editCallback}
            editable={canEdit}
            editing={isEditing}
            showEditButton={props.showEditButton}
            style={{position: 'absolute', right: '2px', top: '2px'}}
          />
        </div>
        <Modal
          show={showConfirmation}
          onHide={onHideConfirmation}
          className={'Editor'}
        >
          <ModalHeader>
            <h5>Leaving Edit Mode</h5>
          </ModalHeader>
          <ModalBody>Do you want to save your changes?</ModalBody>
          <ModalFooter>
            <Button size={'sm'} variant="secondary" onClick={() => cancelEditing()}>Cancel</Button>
            <Button size={'sm'} variant="primary" onClick={() => commitEdits()}>Save</Button>
          </ModalFooter>
        </Modal>
      </>
    ) : (
      <>{(props.textContent?.length > 0 || props.alwaysShow) && (
        <>{props.field}</>
      )}</>
    )}
    </>
  );
}