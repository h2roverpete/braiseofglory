import {Button, Collapse} from "react-bootstrap";
import {useRef, useState} from "react";
import {useNavigate} from "react-router";
import {BsChevronCompactDown, BsChevronCompactUp, BsXLg} from "react-icons/bs";
import PageConfig from "./PageConfig";
import FormEditor from "./FormEditor";
import {useTouchContext} from "../../util/TouchProvider";

/**
 * Edit page metadata fields.
 * @returns {JSX.Element}
 * @constructor
 */
export default function PageConfigPanel() {

  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const {supportsHover} = useTouchContext();

  function collapsePanel() {
    buttonRef.current?.click();
  }

  function onPageUpdated() {
    collapsePanel();
  }

  function onPageDeleted() {
    collapsePanel();
    navigate('/');
  }

  return (<div
    className="PageEditor Editor"
    style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
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
        height: '25px',
        position: 'fixed',
        top: '-5px',
        left: 0,
        zIndex: 1200,
        width: '100%',
      }}
    >
      <Button
        variant=''
        ref={buttonRef}
        onClick={() => setExpanded(!expanded)}
        className={`EditorToggle horizontal ${expanded ? '' : 'collapsed'}`}
        style={{
          border: 'none',
          borderRadius: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
        hidden={supportsHover}
      >
        {expanded ? (<BsChevronCompactUp size={'25'}/>) : ((<BsChevronCompactDown size={'25'}/>))}
      </Button>
    </div>
    <Collapse
      in={expanded}
      dimension={'height'}
      className={'Editor'}
    >
      <div style={{
        backgroundColor: '#e0e0e0f0',
        borderBottom: '1px solid #00000040',
        position: 'fixed',
        zIndex: 1199,
        width: '100%',
        padding: '15px 10px 10px 10px',
      }}>
        <BsXLg
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            fontSize: '14pt',
            cursor: 'pointer',
          }}
          onClick={() => {
            setExpanded(false)
          }}
        />
        <FormEditor>
          <PageConfig onPageUpdated={onPageUpdated} onPageDeleted={onPageDeleted}/>
        </FormEditor>
      </div>
    </Collapse>
  </div>);
}