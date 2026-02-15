import {Button} from "react-bootstrap";
import {BsCheck, BsPencil, BsX} from "react-icons/bs";

/**
 * Display edit/confirm/cancel buttons for an editable text element.
 *
 * @property {boolean} editing          Are we currently editing? (Controls display of edit vs cancel/commit)
 * @property {EditCallback} callback    Callback to receive Edit Actions when buttons are pressed.
 * @property {boolean} showEditButton   Show the edit button? (If false, only commit/cancel will be shown.)
 * @property {boolean} hidden           Hide all the edit buttons?
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function EditButtons({editing, callback, showEditButton, hidden}) {
  return (
    <div
      className={'EditButtons'}
      hidden={hidden === true}
    >
      <Button
        onClick={() => callback(EditAction.CONFIRM)}
        variant={'secondary'}
        size={'sm'}
        className={`EditButton me-1 border text-primary border-primary btn-light ${!editing ? ' d-none' : ''}`}
      ><BsCheck/></Button>
      <Button
        onClick={() => callback(EditAction.CANCEL)}
        variant={'secondary'}
        size={'sm'}
        className={`EditButton me-1 border border-danger text-danger btn-light ${!editing ? ' d-none' : ''}`}
      ><BsX/></Button>
      {showEditButton && !editing && (
        <Button
          onClick={() => callback(EditAction.EDIT)}
          variant={'secondary'}
          size={'sm'}
          className={`EditButton border btn-light`}
        ><BsPencil/></Button>
      )}
    </div>
  );
}

/**
 * Editing actions sent to callback.
 *
 * @enum {string}
 */
export const EditAction = {
  EDIT: "edit",
  CANCEL: "cancel",
  CONFIRM: "confirm",
}