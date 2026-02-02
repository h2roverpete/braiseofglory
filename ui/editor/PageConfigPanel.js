import {Button, Collapse} from "react-bootstrap";
import {lazy, Suspense, useRef, useState} from "react";
import {useNavigate} from "react-router";
import {BsChevronDown, BsChevronUp} from "react-icons/bs";

const PageConfig = lazy(() => import("./PageConfig"));

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
      variant=""
      onClick={() => setExpanded(!expanded)}
      className={`EditorToggle ${expanded ? '' : 'collapsed'}`}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '5px 21px 0 0',
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
      in={true}
      dimension={'height'}
      className={'Editor'}
    >
      <div>
        {expanded && (
          <Suspense fallback={<></>}>
            <PageConfig onPageUpdated={onPageUpdated} onPageDeleted={onPageDeleted}/>
          </Suspense>
        )}
      </div>
    </Collapse>
  </div>);
}