import GuestBook from "../guestbook/GuestBook";
import Gallery from "../gallery/Gallery";
import React from 'react'
import Instagram from "../instagram/Instagram";
import FileExtra from "./FileExtra";

/**
 * Display any page extras.
 * @property {[ExtraData]} extras
 * @constructor
 */
export default function Extras({extras}) {

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