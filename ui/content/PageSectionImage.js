import {BsArrowsMove} from "react-icons/bs";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "./Page";
import {useEdit} from "../editor/EditProvider";
import {useSiteContext} from "./Site";
import FileDropTarget, {DropState} from "../editor/FileDropTarget";
import {Button} from "react-bootstrap";
import {useRef} from "react";
import {useTouchContext} from "../../util/TouchProvider";

/**
 * Display a page section image.
 *
 * Should be inserted before section text if position is "above",
 * otherwise it should be inserted after the section text.
 *
 * @property {PageSectionData} pageSectionData    Data for entire page section.
 * @property {Ref<HTMLImageElement>} imageRef     Returns a reference to the image tag.
 * @property {Ref<DropFunctions>} dropRef         Returns functions API.
 * @property {function(File)} onFileSelected      Callback when a file is dropped.
 * @property {function(File[])} onFilesSelected   Callback when multiple files are dropped.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function PageSectionImage({pageSectionData, imageRef, dropRef, onFileSelected, onFilesSelected}) {

  // imports
  const {PageSections} = useRestApi();
  const {updatePageSection} = usePageContext();
  const {canEdit} = useEdit();
  const {supportsHover} = useTouchContext();
  const {siteData, showErrorAlert} = useSiteContext();

  // refs
  const editButtonRef = useRef(null);

  if (!pageSectionData.SectionImage) {
    return <></>;
  }

  function setImageAlign(align) {
    pageSectionData.ImageAlign = align;
    console.debug(`Updating image alignment...`);
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => {
        console.debug(`Updated image alignment.`)
      })
      .catch(error => showErrorAlert(`Error updating image alignment.`, error));
    updatePageSection(pageSectionData);
  }

  function setImagePosition(position) {
    pageSectionData.ImagePosition = position;
    if (position === 'beside' && pageSectionData.ImageAlign !== 'left' && pageSectionData.ImageAlign !== 'right') {
      // fix alignment to be side by side
      pageSectionData.ImageAlign = 'right';
    }
    console.debug(`Updating image position...`);
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => {
        console.debug(`Updated image position.`)
      })
      .catch(error => showErrorAlert(`Error updating image position.`, error));
    updatePageSection(pageSectionData);
  }

  function hideImageFrame(hide) {
    pageSectionData.HideImageFrame = hide;
    console.debug(`Updating image frame...`);
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => {
        console.debug(`Updated image frame.`)
      })
      .catch(error => showErrorAlert(`Error updating image frame.`, error));
    updatePageSection(pageSectionData);
  }

  function deleteImage() {
    console.debug(`Deleting section image...`);
    PageSections.deleteSectionImage(pageSectionData.PageID, pageSectionData.PageSectionID)
      .then(() => {
        console.debug(`Deleted section image.`)
      })
      .catch(error => showErrorAlert(`Error deleting section image.`, error));
    pageSectionData.SectionImage = null;
    updatePageSection(pageSectionData);
  }

  function setImageWidth(width) {
    console.debug(`Setting image width to ${width}...`);
    pageSectionData.ImageWidth = width;
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => {
        console.debug(`Updated image width.`)
      }).catch(error => showErrorAlert(`Error updating image width.`, error));
    updatePageSection(pageSectionData);
  }

  /**
   * Get image display width.
   *
   * @returns {number|string} Image width in Bootstrap columns, or 0 if data is undefined.
   */
  function getImageWidth() {
    if (pageSectionData) {
      return pageSectionData.ImageWidth > 0 ? pageSectionData.ImageWidth : pageSectionData.ImagePosition === 'beside' ? 7 : 'auto';
    } else {
      return 'auto';
    }
  }

  const imageDivStyle = {position: 'relative'};
  let imageDivClassName = 'SectionImage';
  const imageStyle = {};
  let imageClassName = 'img-fluid';
  if (pageSectionData.ImagePosition === 'beside') {
    // align image left or right beside text
    const w = getImageWidth();
    if (w < 6) {
      // small images remain beside text on small screens
      imageDivClassName += ` mb-0 col-${Math.round(w * 1.25)} col-sm-${w}`;
      if (pageSectionData.ImageAlign === 'right') {
        imageDivClassName += ' ms-3';
      } else if (pageSectionData.ImageAlign === 'left') {
        imageDivClassName += ' me-3';
      }
    } else {
      // larger images go full width below 'sm' boundary
      imageDivClassName += ` mb-3 col-12 col-sm-${w}`;
      if (pageSectionData.ImageAlign === 'right') {
        imageDivClassName += ' ms-sm-3';
      } else if (pageSectionData.ImageAlign === 'left') {
        imageDivClassName += ' me-sm-3';
      }
    }
    imageDivStyle.position = 'relative';
    imageDivStyle.float = pageSectionData.ImageAlign;
    imageDivStyle.textAlign = 'center';
  } else {
    // center image
    imageDivClassName += ` col-sm-12 mb-3`;
    imageDivStyle.display = 'flex'
    imageDivStyle.flexDirection = 'column'
    imageDivStyle.alignItems = pageSectionData.ImageAlign === 'right' ? 'flex-end' : pageSectionData.ImageAlign === 'left' ? 'flex-start' : 'center';
    imageClassName += getImageWidth() > 0 ? ` col-sm-${getImageWidth()}` : '';
  }
  if (pageSectionData.HideImageFrame) {
    // hide frame for this instance of the image
    imageStyle.border = 'none';
    imageStyle.boxShadow = 'none';
  }

  return (
    <>{pageSectionData?.SectionImage && (
      <div
        style={imageDivStyle}
        className={imageDivClassName}
        data-testid={`SectionImageDiv-${pageSectionData.PageSectionID}`}
        onMouseOver={() => {
          if (canEdit && supportsHover) editButtonRef.current.hidden = false;
        }}
        onMouseLeave={() => {
          if (canEdit && supportsHover) editButtonRef.current.hidden = true;
        }}
      >
        <img
          className={imageClassName}
          style={imageStyle}
          src={`${siteData?.SiteRootUrl}/images/` + pageSectionData.SectionImage}
          alt={pageSectionData.SectionTitle}
          data-testid={`SectionImage-${pageSectionData.PageSectionID}`}
          ref={imageRef}
        />
        {canEdit && (
          <>
            <FileDropTarget
              ref={dropRef}
              onFileSelected={onFileSelected}
              onFilesSelected={onFilesSelected}
              onError={(err) => {
                showErrorAlert(err);
                dropRef.current.setDropState(DropState.HIDDEN);
              }}
            />
            <div
              className="EditSectionImage Editor dropdown"
              style={{position: 'absolute', bottom: -5, right: 5, margin:'10px 2px 10px 0'}}
              ref={editButtonRef}
              hidden={supportsHover}
            >
              <Button
                variant="secondary"
                size="sm"
                className={`EditButton border btn-light`}
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              ><BsArrowsMove/></Button>
              <div className="dropdown-menu Editor" style={{cursor: 'pointer', zIndex: 100}}>
                {pageSectionData.ImageAlign !== 'left' && (
                  <span className="dropdown-item" onClick={() => setImageAlign('left')}>Align Left</span>)}
                {pageSectionData.ImageAlign !== 'center' && pageSectionData.ImagePosition === 'above' && (
                  <span className="dropdown-item" onClick={() => setImageAlign('center')}>Align Center</span>)}
                {pageSectionData.ImageAlign !== 'right' && (
                  <span className="dropdown-item" onClick={() => setImageAlign('right')}>Align Right</span>)}
                {pageSectionData.ImagePosition !== 'above' && (
                  <span className="dropdown-item" onClick={() => setImagePosition('above')}>Above Text</span>)}
                {pageSectionData.ImagePosition !== 'beside' && (
                  <span className="dropdown-item" onClick={() => setImagePosition('beside')}>Beside Text</span>)}
                {getImageWidth() > 1 && (
                  <span className="dropdown-item"
                        onClick={() => setImageWidth(getImageWidth() - 1)}>Make Smaller</span>)}
                {getImageWidth() < 12 && (
                  <span className="dropdown-item"
                        onClick={() => setImageWidth(getImageWidth() + 1)}>Make Larger</span>)}
                {pageSectionData.HideImageFrame ?
                  (<span className="dropdown-item" onClick={() => hideImageFrame(false)}>Show Image Frame</span>) :
                  (<span className="dropdown-item" onClick={() => hideImageFrame(true)}>Hide Image Frame</span>)
                }
                <span className="dropdown-item" onClick={() => deleteImage()}>Delete Image</span>
              </div>
            </div>
          </>
        )}
      </div>
    )}</>
  )
}