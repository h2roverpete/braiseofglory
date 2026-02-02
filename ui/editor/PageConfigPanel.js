import {Button, Collapse} from "react-bootstrap";
import {useRef, useState} from "react";
import {useNavigate} from "react-router";
import {BsChevronDown, BsChevronUp} from "react-icons/bs";
import PageConfig from "./PageConfig";

/**
 * Edit page metadata fields.
 * @returns {JSX.Element}
 * @constructor
 */
export default function PageConfigPanel() {

  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const buttonRef = useRef(null);

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
    className="PageEditor Editor dropleft"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
    }}>
    <Button
      ref={buttonRef}
      onClick={() => setExpanded(!expanded)}
      className={`EditorToggle ${expanded ? '' : 'collapsed'}`}
      style={{
        background: 'transparent',
        border: 'none',
        borderRadius: 0,
        padding: '2px 10px 0 0',
        width: '100vw',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'end',
        position: 'fixed',
        zIndex: '1034'
      }}
    >
      {expanded ? (<BsChevronUp size={'20'}/>) : ((<BsChevronDown size={'20'}/>))}
    </Button>
    <Collapse
      in={expanded}
      dimension={'height'}
      className={'Editor'}
    >
      <div style={{
        backgroundColor: '#e0e0e0f0',
        position: 'fixed',
        left: '0px',
        zIndex: '1033',
        borderBottom: '1px solid #00000040',
      }}>
        <div style={{
          width: '100vw',
          padding: '10px 10px 20px 10px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <PageConfig onPageUpdated={onPageUpdated} onPageDeleted={onPageDeleted}/>
        </div>
      </div>
    </Collapse>
  </div>);
}