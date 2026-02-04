import {ProgressBar, Spinner} from "react-bootstrap";
import {useRef, useState} from "react";

// Lambda payload size limit
const SIZE_LIMIT_BYTES = 1024 * 1024 * 6;

const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/uri-list'
]

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
 * @param ref  Reference to functions
 * @param onFileSelected {function(File)} Callback to receive selected file after uploadFile() is called.
 * @param onFilesSelected  {function([File])} Callback to receive multiple selected files after uploadFile() is called.
 * @param onError  {function(Error)} Callback to receive drag and drop errors.
 * @param [mimeTypes] {[String]} List of MIME types that can be dropped. (Default is standard web image formats.)
 * @param [multiple]  {Boolean} Allow multiple file select/drop. (When true, implement both onFileSelected and onFilesSelected callbacks)
 * @returns {JSX.Element}
 * @constructor
 */
export function FileDropTarget({ref, onFileSelected, onFilesSelected, onError, mimeTypes, multiple}) {

  const [dropState, setDropState] = useState(DropState.HIDDEN);
  const [progress, setProgress] = useState({min: 0, max: 100, now: 0});

  if (!mimeTypes) {
    mimeTypes = IMAGE_MIME_TYPES;
  }

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
            <ProgressBar min={progress.min} max={progress.max} now={progress.now}/>
          </span>
        );
      case DropState.UNDEFINED:
      default:
        return (<></>);
    }
  }

  /**
   * Process a dragenter event on the trigger component.
   * @param e {DragEvent} Original drag enter event.
   * @param [state] {DropState} State to display in UI.
   */
  function onDragEnter(e, state) {
    console.log(`DropTarget onDragEnter.`);
    const files = filterDragItems(e.dataTransfer.items)
    if ((multiple === true && files.length > 0) || (!multiple && files.length === 1)) {
      setDropState(state ? state : DropState.ADD);
      e.preventDefault();
    }
  }

  function onDragLeave(e) {
    console.log(`DropTarget onDragLeave.`);
    // this work because dropState is frozen at the time of drag enter
    setDropState(DropState.HIDDEN);
    e.preventDefault();
  }

  function onDragOver(e) {
    console.log(`DropTarget onDragOver.`);
    const files = filterDragItems(e.dataTransfer.items)
    if ((multiple === true && files.length > 0) || (!multiple && files.length === 1)) {
      e.dataTransfer.dropEffect = "copy";
      e.preventDefault();
    } else {
      e.dataTransfer.dropEffect = "none"
    }
  }

  /**
   * Filter dragged items by MIME type.
   *
   * @param dataTransferItems {[DataTransferItem]}
   * @returns {DataTransferItem[]} A list of data transfer items
   */
  function filterDragItems(dataTransferItems) {
    return [...dataTransferItems].filter(
      (item) => {
        return mimeTypes.includes(item.type)
      },
    );
  }

  async function onDrop(e) {
    e.preventDefault();
    let items = filterDragItems(e.dataTransfer.items);
    const files = [];
    for (const item of items) {
      switch (item.kind) {
        case 'file':
          const file = item.getAsFile();
          if (file.size < SIZE_LIMIT_BYTES) {
            files.push(file);
          }
          break;
        case 'string':
          try {
            const f = await new Promise((resolve, reject) => {
              item.getAsString(async (uri) => {
                try {
                  const res = await fetch(uri);
                  const blob = await res.blob();
                  const type = blob.type;
                  if (mimeTypes.includes(type)) {
                    const file = new File([blob], 'tempFileName', {type});
                    resolve(file);
                  } else {
                    reject(new Error("Invalid file type"));
                  }
                } catch (err) {
                  reject(err);
                }
              });
            });
            files.push(f);
          } catch (err) {
            onError?.(err);
          }
          break;
        default:
          // not supported
          break;
      }
    }
    if (multiple === true && files.length > 1) {
      onFilesSelected(files);
    } else if (files.length === 1) {
      onFileSelected(files[0]);
    } else {
      onError?.(new Error('No valid files were dropped.'));
    }
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
    fileInputRef.current.accept = mimeTypes.join(',');
    fileInputRef.current.click();
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
      <input
        type="file"
        ref={fileInputRef}
        hidden={true}
        onChange={fileSelectedHandler}
        multiple={multiple}
      />
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