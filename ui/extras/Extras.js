import GuestBook from "../guestbook/GuestBook";
import Gallery from "../gallery/Gallery";
import React, {useEffect} from 'react'
import Instagram from "../instagram/Instagram";
import FileExtra from "./FileExtra";
import {usePageSectionContext} from "../content/PageSection";

/**
 * Display any page extras.
 *
 * @constructor
 */
export default function Extras() {

  // extras to show
  const {sectionExtras} = usePageSectionContext();
  useEffect(() => {
    console.debug(`Section extras changed: ${JSON.stringify(sectionExtras)}`);
  }, [sectionExtras]);

  return (<>
    {sectionExtras.map((extra) => (<React.Fragment key={extra.ExtraID}>
      {extra.ExtraType === 'guestbook' && (
        <GuestBook guestBookId={extra.GuestBookID} extraId={extra.ExtraID}/>
      )}
      {extra.ExtraType === 'gallery' && (
        <Gallery galleryId={extra.GalleryID} extraId={extra.ExtraID}/>
      )}
      {extra.ExtraType === 'instagram' && (
        <Instagram extraData  ={extra}/>
      )}
      {extra.ExtraType === 'file' && (
        <FileExtra extraData={extra}/>
      )}
    </React.Fragment>))}
  </>)
}