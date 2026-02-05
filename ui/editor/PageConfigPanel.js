import {Button, Collapse} from "react-bootstrap";
import {useRef, useState} from "react";
import {useNavigate} from "react-router";
import {BsChevronCompactDown, BsChevronCompactUp, BsXLg} from "react-icons/bs";
import PageConfig from "./PageConfig";
import FormEditor from "./FormEditor";
import {useTouchContext} from "../../util/TouchProvider";
import EditorPanel from "./EditorPanel";

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

  return (
    <div
      className="PageEditor"
      style={{
        position: 'fixed',
        top: -5,
        width: '100vw',
        zIndex: '1198',
      }}
      onMouseEnter={() => {
        if (supportsHover && buttonRef.current) buttonRef.current.hidden = false;
      }}
      onMouseLeave={() => {
        if (supportsHover && buttonRef.current) buttonRef.current.hidden = true;
      }}
    >
      <FormEditor>
        <EditorPanel buttonRef={buttonRef} expanded={expanded} hideButtons={true}>
          <PageConfig
            onPageUpdated={onPageUpdated}
            onPageDeleted={onPageDeleted}
          />
        </EditorPanel>
      </FormEditor>
    </div>
  );
}