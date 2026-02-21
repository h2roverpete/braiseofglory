import GuestBook from "../guestbook/GuestBook";
import Gallery from "../gallery/Gallery";
import React, {useEffect, useState} from "react";
import FileExtra from "./file/FileExtra";
import YouTubeExtra from "./youtube/YouTubeExtra";
import {Container, Row} from "react-bootstrap";
import InstagramExtra from "./instagram/InstagramExtra";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";

/**
 * Display any extras.
 *
 * @param {[ExtraData]} extras
 *
 * @constructor
 */
export default function Extras({extras}) {

  // imports
  const {hasPermission} = useAuth();

  // states
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.PAGE, Permission.EDIT));
  }, [setCanEdit, hasPermission]);

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
            <InstagramExtra extraData={extra} canEdit={canEdit}/>
          )}
          {extra.ExtraType === 'file' && (
            <FileExtra extraData={extra} canEdit={canEdit}/>
          )}
          {extra.ExtraType === 'youtube' && (
            <YouTubeExtra extraData={extra} canEdit={canEdit}/>
          )}
        </React.Fragment>))}
      </Row>
    </Container>
  )
}