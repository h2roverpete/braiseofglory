import {YouTubeEmbed} from "react-social-media-embed";
import "./YouTubeExtra.css"
import FormEditor from "../../editor/FormEditor";
import {useRef} from "react";
import {useTouchContext} from "../../../util/TouchProvider";
import YouTubeExtraConfig from "./YouTubeExtraConfig";
import MoveExtraMenu from "../MoveExtraMenu";

/**
 * Insert a YouTube video
 *
 * @param extraData {ExtraData}   Data for displaying extra.
 * @param sectionExtras {[ExtraData]}   List of all extras in section.
 * @param canEdit {boolean}   Data for displaying extra.
 * @returns {JSX.Element}
 * @constructor
 */
export default function YouTubeExtra({extraData, sectionExtras, canEdit = false}) {

  const {supportsHover} = useTouchContext();

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  return (
    <div
      className={`YouTubeVideo col-sm-${extraData.DisplayWidth} col-12`}
      style={{display: "flex", flexDirection: "column", position: "relative"}}
      onMouseOver={() => {
        if (supportsHover && canEdit) {
          buttonRef.current.hidden = false;
          if (menuRef.current) {
            menuRef.current.hidden = false;
          }
        }
      }}
      onMouseOut={() => {
        if (supportsHover && canEdit) {
          buttonRef.current.hidden = true
          if (menuRef.current) {
            menuRef.current.hidden = true;
          }
        }
      }}
    >
      <div
        style={{aspectRatio: extraData.AspectRatio, width: '100%'}}
      >
        <YouTubeEmbed url={extraData.YouTubeVideoUrl} width={'100%'} height={'100%'}/>
      </div>
      {canEdit && (<>
        <FormEditor>
          <YouTubeExtraConfig data={extraData} buttonRef={buttonRef}/>
        </FormEditor>
        <MoveExtraMenu extraData={extraData} sectionExtras={sectionExtras} buttonRef={menuRef}/>
      </>)}
    </div>
  );
}