import {YouTubeEmbed} from "react-social-media-embed";
import "./YouTubeExtra.css"
import FormEditor from "../../editor/FormEditor";
import {useRef} from "react";
import {useEdit} from "../../editor/EditProvider";
import {useTouchContext} from "../../../util/TouchProvider";
import YouTubeExtraConfig from "./YouTubeExtraConfig";

/**
 * Insert a YouTube video
 *
 * @param extraData {ExtraData}   Data for displaying extra.
 * @returns {JSX.Element}
 * @constructor
 */
export default function YouTubeExtra({extraData}) {

  const {canEdit} = useEdit();
  const {supportsHover} = useTouchContext();

  const buttonRef = useRef(null);

  return (
    <div
      className={`YouTubeVideo col-sm-${extraData.DisplayWidth} col-12`}
      style={{display: "flex", flexDirection: "column"}}
      onMouseOver={() => {
        if (supportsHover && canEdit) buttonRef.current.hidden = false
      }}
      onMouseOut={() => {
        if (supportsHover && canEdit) buttonRef.current.hidden = true
      }}
    >
      <div
        style={{aspectRatio: extraData.AspectRatio, width: '100%'}}
      >
        <YouTubeEmbed url={extraData.YouTubeVideoUrl} width={'100%'} height={'100%'} />
      </div>
      <FormEditor>
        <YouTubeExtraConfig data={extraData} buttonRef={buttonRef}/>
      </FormEditor>
    </div>
  );
}