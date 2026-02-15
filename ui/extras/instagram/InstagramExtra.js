import {InstagramEmbed} from "react-social-media-embed";
import InstagramExtraConfig from "./InstagramExtraConfig";
import FormEditor from "../../editor/FormEditor";
import {useEffect, useRef, useState} from "react";
import {useTouchContext} from "../../../util/TouchProvider";
import {useEdit} from "../../editor/EditProvider";

/**
 * Embed an Instagram feed.
 *
 * @param extraData   {ExtraData}
 * @returns {JSX.Element}
 * @constructor
 */
export default function InstagramExtra({extraData}) {

  const [data, setData] = useState(null);
  const buttonRef = useRef(null);
  const {supportsHover} = useTouchContext();
  const {canEdit} = useEdit();

  useEffect(() => {
    setData(extraData);
  }, [extraData]);

  return (
    <div
      className={'Instagram mt-4'} style={{width: '100%'}}
      onMouseOver={() => {
        if (supportsHover && canEdit) buttonRef.current.hidden = false
      }}
      onMouseOut={() => {
        if (supportsHover && canEdit) buttonRef.current.hidden = true
      }}
    >
      {data && (
        <InstagramEmbed
          url={`https://www.instagram.com/${data.InstagramHandle.replaceAll(/[^a-zA-Z0-9-\-.]/g, '')}`}
          width={'100%'}/>
      )}
      {canEdit && (
        <FormEditor>
          <InstagramExtraConfig extraData={data} setExtraData={setData} buttonRef={buttonRef}/>
        </FormEditor>
      )}
    </div>
  );
}