import {Button} from "react-bootstrap";
import {BsArrowsMove} from "react-icons/bs";
import React from "react";
import {useTouchContext} from "../../util/TouchProvider";
import {useSiteContext} from "../content/Site";
import {useExtrasContext} from "./Extras";

export default function MoveExtraMenu({buttonRef, extraData, sectionExtras}) {

  const {supportsHover} = useTouchContext();
  const {siteData} = useSiteContext();
  const {moveExtraUp, moveExtraDown} = useExtrasContext();

  return (<>
    {extraData && sectionExtras && sectionExtras.length > 1 &&
      <div
        className="MoveExtra Editor dropdown"
        ref={buttonRef}
        hidden={supportsHover}
      >
        <Button
          variant={siteData?.SiteTheme}
          size="sm"
          className={`EditButton MoveExtraButton`}
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        ><BsArrowsMove/></Button>
        <div className="dropdown-menu Editor" style={{cursor: 'pointer', zIndex: 100}}>
          {extraData.ExtraID !== sectionExtras[0].ExtraID && (
            <span className="dropdown-item" onClick={() => moveExtraUp(extraData)}>Move Up</span>
          )}
          {extraData.ExtraID !== sectionExtras[sectionExtras.length - 1].ExtraID && (
            <span className="dropdown-item" onClick={() => moveExtraDown(extraData)}>Move Down</span>
          )}
        </div>
      </div>
    }
  </>);
}