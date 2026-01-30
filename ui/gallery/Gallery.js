import {useEffect, useRef, useState} from "react";
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from "react-image-gallery";
import {useRestApi} from "../../api/RestApi";
import GalleryConfig from "./GalleryConfig";
import FormEditor from "../editor/FormEditor";
import './Gallery.css';
import {useEdit} from "../editor/EditProvider";
import FileDropTarget, {DropState} from "../editor/FileDropTarget";
import {useSiteContext} from "../content/Site";

/**
 * Display a photo gallery
 *
 * @property {number} galleryId
 * @property {number} extraId
 * @returns {JSX.Element}
 * @constructor
 */
export default function Gallery({galleryId, extraId}) {

  const [galleryConfig, setGalleryConfig] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const {canEdit} = useEdit();
  const {Galleries} = useRestApi();
  const {siteData} = useSiteContext();

  // drag n drop
  const [dropState, setDropState] = useState(DropState.HIDDEN);

  useEffect(() => {
    if (galleryId && !galleryConfig) {
      Galleries.getGallery(galleryId).then((data) => {
        console.debug(`Loaded gallery ${galleryId}.`);
        setGalleryConfig(data);
      }).catch(error => {
        console.error(`Error loading gallery ${galleryId}: ${error}`);
      })
    }
  }, []);

  useEffect(() => {
    Galleries.getPhotos(galleryId).then((data) => {
      console.debug(`Loaded ${data.length} photos for gallery ${galleryId}.`);
      if (data.length === 0) {
        setDropState(DropState.DROP_HERE);
      } else {
        setDropState(DropState.HIDDEN);
      }
      setGalleryPhotos(data);
    }).catch(error => {
      console.error(`Error loading photos for gallery ${galleryId}: ${error}`);
    })
  }, []);

  function dragEnterHandler(e) {
    setDropState(DropState.ADD);
    e.preventDefault();
  }

  function dragOverHandler(e) {
    const fileItems = [...e.dataTransfer.items].filter(
      (item) => item.kind === "file",
    );
    if (fileItems.length > 0) {
      e.preventDefault();
      if (fileItems.some((item) => item.type.startsWith("image/"))) {
        e.dataTransfer.dropEffect = "copy";
      } else {
        e.dataTransfer.dropEffect = "none";
      }
    }
  }

  function dropHandler(e) {
    const files = [...e.dataTransfer.items]
      .map((item) => item.getAsFile())
      .filter((file) => file);
    console.debug(`${files.length} file(s) dropped.`);
    if (files.length === 1) {
      uploadFile(files[0]);
    }
    e.preventDefault();
  }

  function uploadFile(file) {
    setDropState(DropState.UPLOADING);
    Galleries.uploadPhoto(galleryId, file)
      .then((result) => {
        console.debug(`Photo uploaded successfully.`);
        setDropState(DropState.HIDDEN);
        setGalleryPhotos(galleryPhotos => [...galleryPhotos, result]);
      })
      .catch(e => {
        console.error(`Error uploading photo.`, e);
      });
  }

  function dragLeaveHandler(e) {
    console.debug(`Image drag leave...`);
    setDropState(DropState.HIDDEN);
    e.preventDefault();
  }

  const images = [];
  for (const photo of galleryPhotos) {
    if (photo.PhotoFile) {
      // new format upload
      images.push({
        original: `${siteData.SiteRootUrl}/${photo.PhotoFile}`,
        thumbnail: `${siteData.SiteRootUrl}/${photo.PhotoFile}`,
      })
    } else {
      images.push({
        original: `${process.env.PUBLIC_URL}/images/gallery/${photo.SubDirectory.toString().padStart(3, '0')}/${photo.PhotoLarge}`,
        thumbnail: `${process.env.PUBLIC_URL}/images/gallery/${photo.SubDirectory.toString().padStart(3, '0')}/${photo.PhotoSmall}`,
      })
    }
  }

  return (<>
    <div
      className="Gallery mt-4"
      style={{minHeight: '200px', position: 'relative'}}
      onDragLeave={dragLeaveHandler}
      onDragEnter={dragEnterHandler}
      onDragOver={dragOverHandler}
      onDrop={dropHandler}
    >
      {images.length > 0 && (
        <ImageGallery items={images}/>
      )}
      {canEdit && (
        <FileDropTarget state={dropState}/>
      )}
    </div>
    <FormEditor>
      <GalleryConfig
        galleryConfig={galleryConfig}
        setGalleryConfig={setGalleryConfig}
        extraId={extraId}
      />
    </FormEditor>
  </>)
}
