import {useEffect, useState} from "react";
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from "react-image-gallery";
import {useRestApi} from "../../api/RestApi";
import GalleryConfig from "./GalleryConfig";
import FormEditor from "../editor/FormEditor";
import './Gallery.css';

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
  const [galleryPhotos, setGalleryPhotos] = useState(null);
  const {Galleries} = useRestApi();

  useEffect(() => {
    if (galleryId && !galleryConfig) {
      Galleries.getGallery(galleryId).then((data) => {
        console.debug(`Loaded gallery ${galleryId}.`);
        setGalleryConfig(data);
      }).catch(error => {
        console.error(`Error loading gallery ${galleryId}: ${error}`);
      })
    }
  }, [Galleries, galleryId, galleryConfig]);

  useEffect(() => {
    if (galleryId && !galleryPhotos) {
      Galleries.getPhotos(galleryId).then((data) => {
        console.debug(`Loaded ${data.length} photos for gallery ${galleryId}.`);
        setGalleryPhotos(data);
      }).catch(error => {
        console.error(`Error loading photos for gallery ${galleryId}: ${error}`);
      })
    }
  }, [Galleries, galleryId, galleryPhotos]);

  const images = [];
  if (galleryPhotos) {
    for (const photo of galleryPhotos) {
      images.push({
        original: `${process.env.PUBLIC_URL}/images/gallery/${photo.SubDirectory.toString().padStart(3, '0')}/${photo.PhotoLarge}`,
        thumbnail: `${process.env.PUBLIC_URL}/images/gallery/${photo.SubDirectory.toString().padStart(3, '0')}/${photo.PhotoSmall}`,
      })
    }
  }

  return (<>
    <div className="Gallery mt-4">
      <ImageGallery items={images}/>
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
