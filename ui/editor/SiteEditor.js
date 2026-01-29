import {Button, Collapse} from "react-bootstrap";
import {BsChevronLeft, BsChevronRight} from "react-icons/bs";
import SiteFields from "./SiteFields";
import SiteOutline from "./SiteOutline";
import {useState} from "react";
import FormEditor from "./FormEditor";

export default function SiteEditor({children}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="SiteEditor"
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100vw',
        minHeight: '100vh',
        height: '100%'
      }}
    >
      <Button
        onClick={() => setExpanded(!expanded)}
        className={`EditorToggle ${expanded ? 'expanded' : ''} bg-transparent btn-light border-0`}
        style={{
          padding: '21px 0 0 2px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          zIndex: '1032',
          color: 'black'
        }}
      >
        {expanded ? (<BsChevronLeft size={'20'}/>) : ((<BsChevronRight size={'20'}/>))}
      </Button>
      <Collapse
        in={expanded}
        dimension={'width'}
        className={'Editor'}
      >
        <div style={{
          height: '100vh',
          borderRight: '1px solid #00000040',
          backgroundColor: '#e0e0e0f0',
          position: 'fixed',
          left: '0px',
          zIndex: '1031',
        }}>
          <div style={{
            width: '250px',
            padding: '20px 10px 10px 23px',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
          }}>
            <div style={{flexGrow: 1}}>
              <h5>Site Outline</h5>
              <SiteOutline style={{maxHeight: '60vh'}} className={'overflow-auto'}/>
            </div>
            <div style={{flexShrink: 0}}>
              <h5 className={'mt-4'}>Site Properties</h5>
              <FormEditor>
                <SiteFields/>
              </FormEditor>
            </div>
          </div>
        </div>
      </Collapse>
      {children}
    </div>
  )
}