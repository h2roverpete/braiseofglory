import {Button} from "react-bootstrap";
import {BsTextCenter, BsTextLeft, BsTextRight} from "react-icons/bs";
import {useEffect, useState} from "react";

/**
 * @typedef AlignButtonProps
 * @property {boolean} editable
 * @property {boolean} editing
 * @property {callback} callback
 * @property {string} align
 * @property {object} style
 */

/**
 * Display left/center/right alignment buttons when editable.
 *
 * @param {AlignButtonProps} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function AlignButtons(props) {
  const [align, setAlign] = useState(null);
  useEffect(() => {
    if (align === null && props.align) {
      setAlign(props.align);
    }
  }, [align, props.align]);
  return (
    <>
      {props.editing && (
        <div className={'btn-group btn-group-toggle'} style={props.style}>
          <Button
            onClick={() => {
              setAlign('left');
              props.callback(AlignAction.ALIGN_LEFT);
            }}
            name={'align'}
            type="radio"
            variant={'secondary'}
            size={'sm'}
            checked={align==='left'}
            style={{border: 'none', boxShadow: 'none', margin: '2px 1px 2px 2px', padding: '3px 5px'}}
            className={`border border-secondary btn-light ${align === 'left' ? 'text-light bg-primary' : ''}`}
          ><BsTextLeft/></Button>
          <Button
            onClick={() => {
              setAlign('center');
              props.callback(AlignAction.ALIGN_CENTER);
            }}
            type="radio"
            variant={'secondary'}
            size={'sm'}
            name={'align'}
            checked={align==='center'}
            style={{border: 'none', boxShadow: 'none', margin: '2px -2px 2px -2px', padding: '3px 5px'}}
            className={`border border-secondary btn-light ${align === 'center' ? 'text-light bg-primary' : ''}`}
          ><BsTextCenter/></Button>
          <Button
            onClick={() => {
              setAlign('right');
              props.callback(AlignAction.ALIGN_RIGHT);
            }}
            type="radio"
            variant={'secondary'}
            size={'sm'}
            name={'align'}
            checked={align==='right'}
            style={{border: 'none', boxShadow: 'none', margin: '2px 2px 2px 1px', padding: '3px 5px'}}
            className={`border border-secondary btn-light  ${align === 'right' ? 'text-light bg-primary' : ''}`}
          ><BsTextRight/></Button>
        </div>
      )}
    </>
  );
}

/**
 * Actions for callback
 *
 * @enum {string}
 */
export const AlignAction = {
  ALIGN_LEFT: "alignLeft",
  ALIGN_RIGHT: "alignRight",
  ALIGN_CENTER: "alignCenter",
}