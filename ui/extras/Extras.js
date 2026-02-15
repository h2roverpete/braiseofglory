import GuestBook from "../guestbook/GuestBook";
import Gallery from "../gallery/Gallery";
import React, {useEffect, useState} from 'react'
import Instagram from "../instagram/Instagram";
import FileExtra from "./FileExtra";
import {usePageContext} from "../content/Page";

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

  return (<>
    {extras.map((extra) => (<React.Fragment key={extra.ExtraID}>
      {extra.ExtraType === 'guestbook' && (
        <GuestBook guestBookId={extra.GuestBookID} extraId={extra.ExtraID}/>
      )}
      {extra.ExtraType === 'gallery' && (
        <Gallery galleryId={extra.GalleryID} extraId={extra.ExtraID}/>
      )}
      {extra.ExtraType === 'instagram' && (
        <Instagram extraData={extra}/>
      )}
      {extra.ExtraType === 'file' && (
        <FileExtra extraData={extra}/>
      )}
    </React.Fragment>))}
  </>)
}