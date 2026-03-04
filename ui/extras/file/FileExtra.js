import {useSiteContext} from "../../content/Site";
import {useEffect, useRef, useState} from "react";
import FileExtraConfig from "./FileExtraConfig";
import FormEditor from "../../editor/FormEditor";
import {useTouchContext} from "../../../util/TouchProvider";
import FileExtraIcon from "./FileExtraIcon";
import MoveExtraMenu from "../MoveExtraMenu";

export default function FileExtra({extraData, sectionExtras, canEdit = false}) {

  const {siteData} = useSiteContext();
  const [content, setContent] = useState(<></>);
  const {supportsHover} = useTouchContext();
  const buttonRef = useRef(null);
  const moveButtonRef = useRef(null);

  useEffect(() => {
    if (siteData && extraData) {
      const parts = extraData.ExtraFile.split("/");
      const fileUrl = `${siteData?.SiteRootUrl}/${extraData.ExtraFile}`;
      const fileName = parts[parts.length - 1];
      switch (extraData.ExtraFileMimeType) {
        case 'audio/mpeg':
          setContent(
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start'}}>
              <FileExtraIcon type={extraData.ExtraFileIcon} className={'me-2'} />
              <div className={'text-nowrap me-2'}>{extraData.ExtraFilePrompt}</div>
              <audio controls>
                <source src={fileUrl}/>
              </audio>
            </div>
          );
          break;
        case 'text/plain':
          // embed HTML on the page
          fetch(fileUrl)
            .then(response => response.text())
            .then(data => setContent(<>
              <pre className={'FileExtra'}>{data}</pre>
            </>))
            .catch(error => console.error(`Error fetching HTML ${fileUrl}:`, error));
          break;
        case 'text/html':
          // embed HTML on the page
          fetch(fileUrl)
            .then(response => response.text())
            .then(data => setContent(<>
              <div className={'FileExtra'} dangerouslySetInnerHTML={{__html: data}}/>
            </>))
            .catch(error => console.error(`Error fetching HTML ${fileUrl}:`, error));
          break;
        default:
          // display a link to the file
          setContent(
            <a
              style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}
              href={fileUrl}
            >
              <div style={{paddingRight: '5px'}}><FileExtraIcon type={extraData.ExtraFileIcon}/></div>
              <div
                className={'text-nowrap flex-grow-1'}>{extraData.ExtraFilePrompt ? extraData.ExtraFilePrompt : fileName}</div>
            </a>
          );
          break;
      }
    }
  }, [siteData, extraData]);

  return (<div
    className={`FileExtra col-12 col-sm-${extraData?.DisplayWidth} mt-4 p-0`}
    style={{position: 'relative'}}
    onMouseOver={() => {
      if (canEdit && supportsHover) {
        buttonRef.current.hidden = false;
        if (moveButtonRef.current) {
          moveButtonRef.current.hidden = false;
        }
      }
    }}
    onMouseOut={() => {
      if (canEdit && supportsHover) {
        buttonRef.current.hidden = true;
        if (moveButtonRef.current) {
          moveButtonRef.current.hidden = true;
        }
      }
    }}>
    {content}
    {canEdit && (<>
      <FormEditor>
        <FileExtraConfig extraData={extraData} buttonRef={buttonRef}/>
      </FormEditor>
      <MoveExtraMenu extraData={extraData} sectionExtras={sectionExtras} buttonRef={moveButtonRef}/>
    </>)}
  </div>);
}