import {Button, Collapse} from "react-bootstrap";
import {BsChevronCompactLeft, BsChevronCompactRight, BsXLg} from "react-icons/bs";
import SiteOutline from "./SiteOutline";
import FormEditor from "./FormEditor";
import {useRef, useState} from "react";
import SiteConfig from "./SiteConfig";
import {useTouchContext} from "../../util/TouchProvider";

export default function SiteConfigPanel() {

  const [expanded, setExpanded] = useState(false);
  const buttonRef = useRef(null);
  const {supportsHover} = useTouchContext();

  return (<div
    className={'Editor SiteEditor'}
    style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
    }}
    onMouseEnter={() => {
      if (supportsHover && buttonRef.current) buttonRef.current.hidden = false;
    }}
    onMouseLeave={() => {
      if (supportsHover && buttonRef.current) buttonRef.current.hidden = true;
    }}
  >
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: '-5px',
        zIndex: 1198,
        height: '100vh',
        width: '25px',
      }}
    >
      <Button
        variant=""
        onClick={() => setExpanded(!expanded)}
        className={`EditorToggle vertical ${expanded ? 'expanded' : 'collapsed'}`}
        style={{
          padding: '30px 5px 0 0',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        hidden={supportsHover}
        ref={buttonRef}
      >
        {expanded ? (<BsChevronCompactLeft size={'25'}/>) : ((<BsChevronCompactRight size={'25'}/>))}
      </Button>
    </div>
    <Collapse
      in={expanded}
      dimension={'width'}
      className={'Editor'}
    >
      <div style={{
        backgroundColor: '#e0e0e0f0',
        borderRight: '1px solid #00000040',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1197,
        padding: '10px 10px 10px 10px',
        height: '100vh'
      }}>
        <div style={{
          width: '200px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
        }}>
          <BsXLg
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              fontSize: '14pt',
              cursor: 'pointer',
            }}
            onClick={() => {
              setExpanded(false)
            }}
          />
          <div style={{
            flexGrow: 1,
            flexShrink: 1,
            overflow: 'hidden',
          }}>
            <SiteOutline/>
          </div>
          <div style={{
            flexGrow: 0,
            flexShrink: 0,
          }}>
            <FormEditor>
              <SiteConfig/>
            </FormEditor>
          </div>
        </div>
      </div>
    </Collapse>
  </div>);
}