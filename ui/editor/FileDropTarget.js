import {ProgressBar, Spinner} from "react-bootstrap";
import './FileDropTarget.css';
import {useRef, useState} from "react";

/**
 * Drop target component for uploading files.
 * Meant to cover an image or another valid drop area.
 *
 * Attach an onDragEnter handler to your visible drop target
 * and pass it to the onDragEnter function in the ref object.
 * onDragEnter() will display the component with the selected
 * prompt and track user interaction until the file is dropped,
 * or they drag away from the target.
 *
 * Provide onFileSelected and/or onFilesSelected callbacks to receive
 * the drop result.
 *
 * Display a file picker by calling selectFile() in the ref object.
 */

/**
 * @typedef ProgressData
 * @property {number} min
 * @property {number} max
 * @property {number} now
 */

/**
 * @typedef DropFunctions
 * @property {function()} selectFile
 * @property {function(Event)} onDragEnter
 * @property {function({DropState})} setDropState
 * @property {function({ProgressData})} setProgress
 */

/**
 * Insert a div as a file drop target.
 *
 * @param state Current state to display from DropState
 * @param ref  Reference to functions
 * @param onFileSelected Callback to receive selected file after uploadFile() is called.
 * @param onFilesSelected  Callback to receive multiple selected files after uploadFile() is called.
 * @returns {JSX.Element}
 * @constructor
 */
export function FileDropTarget({ref, onFileSelected, onFilesSelected}) {

  const [dropState, setDropState] = useState(DropState.HIDDEN);
  const [savedDropState, setSavedDropState] = useState(DropState.HIDDEN);
  const [allowedMimeTypes, setAllowedMimeTypes] = useState([]);
  const [progress, setProgress] = useState({min: 0, max: 100, now: 0});

  function renderContent() {
    switch (dropState) {
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
          <span>
            Uploading...<br/>
            <Spinner animation="border" role="status"/>
          </span>
        );
      case DropState.UPLOADING_MULTIPLE:
        return (
          <span>
            Uploading...<br/>
            <ProgressBar min={progress.min} max={progress.max} now={progress.now} />
          </span>
        );
      case DropState.UNDEFINED:
      default:
        return (<></>);
    }
  }

  /**
   * Process a dragenter event on the trigger component.
   * @param e {Event} Original drag enter event.
   * @param [state] {DropState} State to display in UI.
   * @param [mimeTypes] {[{String}]} List of allowed MIME types to drop.
   */
  function onDragEnter(e, state, mimeTypes) {
    console.log(`DropTarget onDragEnter.`);
    if (mimeTypes) {
      setAllowedMimeTypes(allowedMimeTypes);
    }
    setSavedDropState(dropState);
    setDropState(state ? state : DropState.ADD);
    e.preventDefault();
  }

  function onDragLeave(e) {
    console.log(`DropTarget onDragLeave.`);
    setDropState(savedDropState);
    e.preventDefault();
  }

  function onDragOver(e) {
    console.log(`DropTarget onDragOver.`);
    const fileItems = [...e.dataTransfer.items].filter(
      (item) => item.kind === "file",
    );
    if (fileItems.length > 0) {
      e.preventDefault();
      if (fileItems.some((item) => allowedMimeTypes.includes(item.type) || allowedMimeTypes.length === 0)) {
        // allowed mime type, or no tye list provided
        e.dataTransfer.dropEffect = "copy";
      } else {
        e.dataTransfer.dropEffect = "none";
      }
    }
  }

  function onDrop(e) {
    const files = [...e.dataTransfer.items]
      .map((item) => item.getAsFile());
    console.debug(`DropTarget onDrop: ${files.length} file(s) dropped.`);
    if (files.length === 1) {
      onFileSelected(files[0]);
    } else {
      onFilesSelected(files);
    }
    e.preventDefault();
  }

  const fileInputRef = useRef(null);

  if (ref) {
    // callable functions
    ref.current = {
      selectFile: selectFile,
      onDragEnter: onDragEnter,
      setDropState: setDropState,
      setProgress: setProgress,
    }
  }

  function selectFile() {
    fileInputRef.current?.click();
  }

  function fileSelectedHandler(e) {
    const files = [...e.target.files];
    console.debug(`${files.length} file(s) selected.`);
    if (files.length === 1) {
      // single file select
      onFileSelected?.(files[0]);
    } else {
      // multiple file select
      onFileSelected?.(files);
    }
    e.preventDefault();
  }

  return (
    <div
      className={`DropFile Editor ${dropState}`}
      hidden={dropState === DropState.HIDDEN}
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input type="file" ref={fileInputRef} hidden={true} onChange={fileSelectedHandler}/>
      <div
        style={{pointerEvents: 'none', paddingLeft: '20px', paddingRight: '20px'}}
      >
        {renderContent()}
      </div>
    </div>
  )
}

export class DropState {
  static DROP_HERE = 'drophere';
  static INSERT = 'upload';
  static REPLACE = 'replace';
  static ADD = 'add';
  static UPLOADING = 'uploading';
  static UPLOADING_MULTIPLE = 'uploadingmultiple';
  static HIDDEN = 'hidden';
  static UNDEFINED = '';
}

export default FileDropTarget;