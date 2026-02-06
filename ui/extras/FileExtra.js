import {useSiteContext} from "../content/Site";
import {useEffect, useRef, useState} from "react";
import ExtraConfig from "./ExtraConfig";
import {Col, Container, Row} from "react-bootstrap";
import FormEditor from "../editor/FormEditor";
import {useTouchContext} from "../../util/TouchProvider";
import {useEdit} from "../editor/EditProvider";

export default function FileExtra({extraData}) {

  const {siteData} = useSiteContext();
  const [content, setContent] = useState(<></>);
  const {supportsHover} = useTouchContext();
  const buttonRef = useRef();
  const {canEdit} = useEdit();

  useEffect(() => {
    if (siteData && extraData) {
      const parts = extraData.ExtraFile.split("/");
      const fileUrl = `${siteData?.SiteRootUrl}/${extraData.ExtraFile}`;
      const fileName = parts[parts.length - 1];
      switch (extraData.ExtraFileMimeType) {
        case 'audio/mpeg':
          setContent(<>
            <Container className={'Extra'}>
              <Row className="ExtraAudio">
                <Col xs={'auto'} className={'ExtraAudioLabel d-flex align-items-center ps-0'}>
                  {extraData.ExtraFilePrompt}
                </Col>
                <Col xs='auto' className={'ExtraAudioPlayer d-flex align-items-center'}>
                  <audio controls>
                    <source src={fileUrl}/>
                  </audio>
                </Col>
              </Row>
            </Container>
          </>);
          break;
        case 'text/plain':
          // embed HTML on the page
          fetch(fileUrl)
            .then(response => response.text())
            .then(data => setContent(<>
              <pre className={'Extra'}>{data}</pre>
            </>))
            .catch(error => console.error(`Error fetching HTML ${fileUrl}:`, error));
          break;
        case 'text/html':
          // embed HTML on the page
          fetch(fileUrl)
            .then(response => response.text())
            .then(data => setContent(<>
              <div className={'Extra'} dangerouslySetInnerHTML={{__html: data}}/>
            </>))
            .catch(error => console.error(`Error fetching HTML ${fileUrl}:`, error));
          break;
        default:
          // display a link to the file
          setContent(<>
            <div className={'Extra'}>
              <a
                href={fileUrl} rel="noreferrer"
                target={'_blank'}>{extraData.ExtraFilePrompt ? extraData.ExtraFilePrompt : fileName}</a>
            </div>
          </>);
          break;
      }
    }
  }, [siteData, extraData]);
  return (<div
    onMouseOver={() => {
      if (canEdit && supportsHover) buttonRef.current.hidden = false;
    }}
    onMouseOut={() => {
      if (canEdit && supportsHover) buttonRef.current.hidden = true;
    }}>
    {content}
    {canEdit && (
      <FormEditor>
        <ExtraConfig extraData={extraData} buttonRef={buttonRef}/>
      </FormEditor>
    )}
  </div>);
}