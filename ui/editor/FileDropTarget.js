import {Spinner} from "react-bootstrap";
import './FileDropTarget.css';

/**
 * Insert a div as a file drop target.
 *
 * @param ref
 * @param state
 * @returns {JSX.Element}
 * @constructor
 */
export function FileDropTarget({state}) {

  function renderContent() {
    switch (state) {
      case DropState.DROP_HERE:
        return (<span>Drag and drop files here.</span>);
      case DropState.INSERT:
        return (<span>Drop file to insert image.</span>);
      case DropState.REPLACE:
        return (<span>Drop file to replace image.</span>);
      case DropState.ADD:
        return (<span>Drop file to add image.</span>);
      case DropState.UPLOADING:
        return (
          <span>Uploading...<br/>
          <Spinner animation="border" role="status"/>
            </span>
        );
      case DropState.UNDEFINED:
      default:
        return (<></>);
    }
  }

  return (
    <div
      className={`DropFile Editor ${state}`}
      hidden={state === DropState.HIDDEN}
      style={{pointerEvents: 'none'}}
    >
      {renderContent()}
    </div>
  )
}

export class DropState {
  static DROP_HERE = 'drophere';
  static INSERT = 'upload';
  static REPLACE = 'replace';
  static ADD = 'add';
  static UPLOADING = 'uploading';
  static HIDDEN = 'hidden';
  static UNDEFINED = '';
}

export default FileDropTarget;