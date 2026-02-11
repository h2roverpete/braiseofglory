import React, {useEffect, useMemo, useRef, useState} from "react";
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from "react-image-gallery";
import {useRestApi} from "../../api/RestApi";
import GalleryConfig from "./GalleryConfig";
import FormEditor from "../editor/FormEditor";
import './Gallery.css';
import {useEdit} from "../editor/EditProvider";
import FileDropTarget, {DropState} from "../editor/FileDropTarget";
import {useSiteContext} from "../content/Site";
import {Button} from "react-bootstrap";
import {BsThreeDotsVertical} from "react-icons/bs";
import {useTouchContext} from "../../util/TouchProvider";

/**
 * Display a photo gallery
 *
 * @property {number} galleryId
 * @property {number} extraId
 * @returns {JSX.Element}
 * @constructor
 */
export default function Gallery({galleryId, extraId}) {

  // imports
  const {canEdit} = useEdit();
  const {Galleries} = useRestApi();
  const {siteData, showErrorAlert} = useSiteContext();
  const {supportsHover} = useTouchContext();

  // states
  const [galleryConfig, setGalleryConfig] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  // refs
  const fileDropRef = useRef(null);
  const buttonRef = useRef(null);
  const expandButtonRef = useRef(null);

  useEffect(() => {
    if (galleryId) {
      Galleries.getGallery(galleryId).then((data) => {
        console.debug(`Loaded gallery ${galleryId}.`);
        setGalleryConfig(data);
      }).catch(error => {
        showErrorAlert(`Error loading gallery ${galleryId}: ${error}`);
      })
    }
  }, [galleryId, showErrorAlert, Galleries]);

  useEffect(() => {
    if (galleryPhotos.length === 0) {
      Galleries.getPhotos(galleryId).then((data) => {
        console.debug(`Loaded ${data.length} photos for gallery ${galleryId}.`);
        if (galleryConfig?.RandomizeOrder) {
          data.sort(() => Math.random() - 0.5);
        }
        if (data.length > 0) {
          setCurrentPhoto(data[0]);
        }
        setGalleryPhotos(data);
      }).catch(error => {
        showErrorAlert(`Error loading photos for gallery ${galleryId}: ${error}`);
      })
    }
  }, [galleryId, galleryConfig, showErrorAlert, Galleries, galleryPhotos.length]);

  function uploadFile(file) {
    console.debug(`Uploading photo...`);
    fileDropRef.current?.setDropState(DropState.UPLOADING);
    Galleries.uploadPhoto(galleryId, file)
      .then((result) => {
        console.debug(`Photo uploaded successfully.`);
        fileDropRef.current?.setDropState(DropState.HIDDEN);
        setGalleryPhotos(galleryPhotos => [...galleryPhotos, result]);
        if (!currentPhoto) {
          setCurrentPhoto(result);
        }
      })
      .catch(e => {
        fileDropRef.current?.setDropState(DropState.HIDDEN);
        showErrorAlert(`Error uploading photo.`, e);
      });
  }

  function uploadFiles(files) {
    fileDropRef.current?.setDropState(DropState.UPLOADING_MULTIPLE);
    const progress = {
      min: 0,
      max: files.length,
      now: 1
    };
    console.debug(`Uploading ${files.length} photos...`);
    fileDropRef.current?.setProgress(progress);
    const promises = [];
    for (const file of files) {
      promises.push(
        new Promise((resolve, reject) => {
            Galleries.uploadPhoto(galleryId, file)
              .then((result) => {
                console.debug(`Photo uploaded successfully.`);
                progress.now++;
                fileDropRef.current?.setProgress({...progress});
                resolve(result);
              }).catch(reject);
          }
        )
      )
    }
    runSequentialFunctions(promises).then((newPhotos) => {
      setGalleryPhotos([...galleryPhotos, ...newPhotos]);
      fileDropRef.current?.setDropState(DropState.HIDDEN);
    }).catch(e => showErrorAlert(`Error uploading photos.`, e));
  }

  function onDropError(error) {
    fileDropRef.current?.setDropState(DropState.HIDDEN);
    showErrorAlert(error);
  }

  const images = useMemo(() => {
    // build list of images for gallery
    console.debug(`Build list of images for gallery control...`);
    const list = [];
    for (const photo of galleryPhotos) {
      if (photo.PhotoFile && siteData) {
        // new format upload
        list.push({
          original: `${siteData.SiteRootUrl}/${photo.PhotoFile}`,
          thumbnail: `${siteData.SiteRootUrl}/${photo.PhotoFile}`,
        })
      } else if (photo.PhotoSmall && photo.PhotoLarge) {
        list.push({
          original: `${process.env.PUBLIC_URL}/images/gallery/${photo.SubDirectory.toString().padStart(3, '0')}/${photo.PhotoLarge}`,
          thumbnail: `${process.env.PUBLIC_URL}/images/gallery/${photo.SubDirectory.toString().padStart(3, '0')}/${photo.PhotoSmall}`,
        })
      }
    }
    console.debug(`Built list of ${list.length} images.`);
    return list;
  }, [galleryPhotos, siteData]);

  useEffect(() => {
    // keep current photo in sync with gallery display
    console.debug(`Checking current photo.`);
    if (!currentPhoto && galleryPhotos.length > 0) {
      console.debug(`Setting current photo to first.`);
      setCurrentPhoto(galleryPhotos[0]);
    } else if (currentPhoto && galleryPhotos.length === 0) {
      console.debug(`Setting current photo to null.`);
      setCurrentPhoto(null);
    } else if (currentPhoto && galleryPhotos.length > 0) {
      const index = galleryRef.current?.getCurrentIndex();
      if (index >= 0 && currentPhoto.PhotoID !== galleryPhotos[index].PhotoID) {
        for (let i = 0; i < galleryPhotos.length; i++) {
          if (galleryPhotos[i].PhotoID === currentPhoto.PhotoID) {
            console.debug(`Sliding to current photo.`);
            galleryRef.current?.slideToIndex(i)
          }
        }
      }
    }
  }, [galleryPhotos, currentPhoto]);

  const galleryRef = useRef(null);

  function onSlide(currentIndex) {
    setCurrentPhoto(galleryPhotos[currentIndex]);
  }

  function onDeletePhoto() {
    if (currentPhoto) {
      console.debug(`Delete photo ${currentPhoto.PhotoID}`);
      Galleries.deletePhoto(galleryId, currentPhoto.PhotoID).then((result) => {
        console.debug(`Photo deleted.`);
        const newPhotos = [];
        for (const photo of galleryPhotos) {
          if (photo.PhotoID !== result.PhotoID) {
            newPhotos.push(photo);
          }
        }
        setGalleryPhotos(newPhotos);
        setCurrentPhoto(null);
      }).catch(error => showErrorAlert(`Error deleting photo.`, error));
    }
  }

  /**
   * See if user is pasting image data.
   */
  function onPaste(e) {
    console.debug(`Paste to gallery.`);
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        uploadFile(file);
        e.preventDefault();
      }
    }
  }

  return (<div
    style={{
      position: 'relative',
      flex: 1,
      width: '100%'
    }}
    onDragEnter={(e) => {
      if (canEdit) {
        fileDropRef.current?.onDragEnter(e, DropState.ADD);
      }
    }}
    onMouseOver={() => {
      if (canEdit && supportsHover) {
        // show editor button and property panel
        buttonRef.current.hidden = false;
        expandButtonRef.current.hidden = false;
      }
    }}
    onMouseOut={() => {
      if (canEdit && supportsHover) {
        // hide editor button and property panel
        buttonRef.current.hidden = true;
        expandButtonRef.current.hidden = true;
      }
    }}
  >
    <div
      className="Gallery"
      style={{
        position: 'relative',
      }}
      onPaste={(e) => {
        if (canEdit) {
          onPaste(e)
        }
      }}
      onTouchMove={(e) => {
        e.stopPropagation()
      }}
    >
      {images?.length > 0 && (
        <ImageGallery items={images} ref={galleryRef} onSlide={onSlide}/>
      )}
      {canEdit && (<>
          {images?.length === 0 && (
            <div style={{
              position: 'relative',
              height: '100px',
            }}>
              <div className={'Editor EmptyElement'}>(Empty Gallery)</div>
            </div>
          )}
          <FileDropTarget
            ref={fileDropRef}
            onFileSelected={uploadFile}
            onFilesSelected={uploadFiles}
            onError={onDropError}
            multiple={true}
          />
          <div
            className="EditGalleryPhoto Editor dropdown"
            style={{
              position: 'absolute',
              top: 0,
              right: '5px',
            }}
            hidden={supportsHover}
            ref={buttonRef}
          >
            <Button
              className={`EditButton btn-light mt-1`}
              type="button"
              variant={'secondary'}
              size={'sm'}
              aria-expanded="false"
              data-bs-toggle="dropdown"
            >
              <BsThreeDotsVertical/>
            </Button>
            <div
              className="dropdown-menu Editor border-secondary border-opacity-25"
              style={{zIndex: 100}}
            >
              {currentPhoto && (<span className="dropdown-item" onClick={onDeletePhoto}>
                Delete Photo
              </span>)}
              <span className="dropdown-item" onClick={fileDropRef.current?.selectFile}>
                Upload a Photo
              </span>
            </div>
          </div>
        </>
      )}
    </div>
    {
      canEdit && (
        <FormEditor>
          <GalleryConfig
            galleryConfig={galleryConfig}
            setGalleryConfig={setGalleryConfig}
            extraId={extraId}
            buttonRef={expandButtonRef}
          />
        </FormEditor>
      )
    }
  </div>)
}

/**
 * Utility to run an Iterable of Promises serially.
 * Like Promise.all() but not concurrent.
 * Returns an array of all the resolved values.
 *
 * @param promiseFunctions {[Promise<any>]}
 * @returns {[any]}
 */
function runSequentialFunctions(promiseFunctions) {
  return promiseFunctions.reduce((promiseChain, currentFunction) => {
    return promiseChain.then(resultsSoFar => {
      // Execute the current promise-returning function
      return currentFunction.then(currentResult => {
        // Concatenate the new result to the existing array of results
        return [...resultsSoFar, currentResult];
      });
    });
  }, Promise.resolve([])); // Start with a promise that resolves to an empty array
}