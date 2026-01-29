import {Button} from "react-bootstrap";
import {BsCheck, BsPencil, BsX} from "react-icons/bs";

/**
 * @typedef EditButtonProps
 * @property {boolean} editable
 * @property {boolean} editing
 * @property {callback} callback
 * @property {string} align
 * @property {boolean} showEditButton
 */

/**
 * Display edit/confirm/cancel buttons when editable.
 *
 * @param {EditButtonProps} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function EditButtons(props) {
  return (
    <>
      {props.editable && (
        <div style={{whiteSpace: "nowrap", position: 'absolute', top: '2px', right: '2px'}}>
          <Button
            onClick={() => props.callback(EditAction.CONFIRM)}
            variant={'secondary'}
            size={'sm'}
            style={{border: 'none', boxShadow: 'none', margin: '2px', padding: '3px 5px'}}
            className={`border text-primary border-primary btn-light ${!props.editing ? ' d-none' : ''}`}
          ><BsCheck/></Button>
          <Button
            onClick={() => props.callback(EditAction.CANCEL)}
            variant={'secondary'}
            size={'sm'}
            style={{border: 'none', boxShadow: 'none', margin: '2px', padding: '3px 5px'}}
            className={`border border-danger text-danger btn-light ${!props.editing ? ' d-none' : ''}`}
          ><BsX/></Button>
          {props.showEditButton && !props.editing && (
            <Button
              onClick={() => props.callback(EditAction.EDIT)}
              variant={'secondary'}
              size={'sm'}
              style={{border: 'none', boxShadow: 'none', margin: '2px', padding: '3px 5px'}}
              className={`border btn-light`}
            ><BsPencil/></Button>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Site permissions.
 *
 * @enum {string}
 */
export const EditAction = {
  EDIT: "edit",
  CANCEL: "cancel",
  CONFIRM: "confirm",
}