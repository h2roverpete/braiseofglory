import GuestBook from "../guestbook/GuestBook";
import Gallery from "../gallery/Gallery";
import React from "react";
import FileExtra from "./file/FileExtra";
import YouTubeExtra from "./youtube/YouTubeExtra";
import {Container, Row} from "react-bootstrap";
import InstagramExtra from "./instagram/InstagramExtra";

/**
 * Display any extras.
 *
 * @param {[ExtraData]} extras
 *
 * @constructor
 */
export default function Extras({extras}) {
  return (<Container fluid={true}>
      <Row className="ExtrasRow">
        {extras?.map((extra) => (<React.Fragment key={extra.ExtraID}>
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
      </Row>
    </Container>
  )
}