import GuestBook from "../guestbook/GuestBook";
import Gallery from "../gallery/Gallery";
import React, {useEffect, useState} from 'react'
import FileExtra from "./file/FileExtra";
import {usePageContext} from "../content/Page";
import YouTubeExtra from "./youtube/YouTubeExtra";
import {Row} from "react-bootstrap";
import InstagramExtra from "./instagram/InstagramExtra";

/**
 * Display any extras.
 *
 * @property {number} pageSectionId
 *
 * @constructor
 */
export default function Extras({pageSectionId}) {

  const {pageExtras} = usePageContext();
  const [extras, setExtras] = useState([]);
  useEffect(() => {
    // manage extras
    if (pageExtras && pageSectionId) {
      const list = pageExtras.filter((extra) => extra.PageSectionID === pageSectionId);
      setExtras(list);
      console.debug(`Updated extras for section ${pageSectionId}.`);
    }
  },[pageSectionId, pageExtras, setExtras]);

  return (<Row>
    {extras.map((extra) => (<React.Fragment key={extra.ExtraID}>
      {extra.ExtraType === 'guestbook' && (
        <GuestBook guestBookId={extra.GuestBookID} extraId={extra.ExtraID}/>
      )}
      {extra.ExtraType === 'gallery' && (
        <Gallery galleryId={extra.GalleryID} extraId={extra.ExtraID}/>
      )}
      {extra.ExtraType === 'instagram' && (
        <InstagramExtra extraData={extra}/>
      )}
      {extra.ExtraType === 'file' && (
        <FileExtra extraData={extra}/>
      )}
      {extra.ExtraType === 'youtube' && (
        <YouTubeExtra extraData={extra}/>
      )}
    </React.Fragment>))}
  </Row>)
}