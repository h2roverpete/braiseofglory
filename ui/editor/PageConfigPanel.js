import {Button, Collapse} from "react-bootstrap";
import {useRef, useState} from "react";
import {useNavigate} from "react-router";
import {BsChevronCompactDown, BsChevronCompactUp} from "react-icons/bs";
import PageConfig from "./PageConfig";
import FormEditor from "./FormEditor";

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
    className="PageEditor Editor"
    style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
    }}>
    <Button
      ref={buttonRef}
      onClick={() => setExpanded(!expanded)}
      className={`EditorToggle ${expanded ? '' : 'collapsed'}`}
      style={{
        border: 'none',
        borderRadius: 0,
        padding: '0 10px 5px 0',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'fixed',
        top: '-5px',
        left: 0,
        zIndex: 1200,
        width: '100%',
      }}
    >
      {expanded ? (<BsChevronCompactUp size={'25'}/>) : ((<BsChevronCompactDown size={'25'}/>))}
    </Button>
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
        padding: '10px 10px 10px 10px',

      }}>
        <FormEditor>
          <PageConfig onPageUpdated={onPageUpdated} onPageDeleted={onPageDeleted}/>
        </FormEditor>
      </div>
    </Collapse>
  </div>);
}