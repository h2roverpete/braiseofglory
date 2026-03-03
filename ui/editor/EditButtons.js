import {Button} from "react-bootstrap";
import {BsCheck, BsPencil, BsX} from "react-icons/bs";
import {useSiteContext} from "../content/Site";

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

  const {siteData} = useSiteContext();

  return (
    <div
      className={'EditButtons'}
      hidden={hidden === true}
    >
      <Button
        onClick={() => callback(EditAction.CONFIRM)}
        variant={siteData?.SiteTheme}
        size={'sm'}
        className={`EditButton me-1 text-primary border-primary ${!editing ? ' d-none' : ''}`}
      ><BsCheck/></Button>
      <Button
        onClick={() => callback(EditAction.CANCEL)}
        variant={siteData?.SiteTheme}
        size={'sm'}
        className={`EditButton me-1 border-danger text-danger ${!editing ? ' d-none' : ''}`}
      ><BsX/></Button>
      {showEditButton && !editing && (
        <Button
          onClick={() => callback(EditAction.EDIT)}
          variant={siteData?.SiteTheme}
          size={'sm'}
          className={`EditButton`}
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