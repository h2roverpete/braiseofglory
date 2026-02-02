import {BsArrowsMove} from "react-icons/bs";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "./Page";
import {useEdit} from "../editor/EditProvider";
import {useSiteContext} from "./Site";
import FileDropTarget from "../editor/FileDropTarget";
import {Button} from "react-bootstrap";
import {usePageSectionContext} from "./PageSection";

/**
 * Insert an editable page section image.
 * Should be inserted before section text if position is "above",
 * otherwise it should be inserted after the section text.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function PageSectionImage({imageRef, dropRef, onFileSelected, onFilesSelected}) {

  const {PageSections} = useRestApi();
  const {updatePageSection} = usePageContext();
  const {pageSectionData} = usePageSectionContext();
  const {canEdit} = useEdit();
  const {siteData, showErrorAlert} = useSiteContext();

  if (!pageSectionData.SectionImage) {
    return <></>;
  }

  function setImageAlign(align) {
    pageSectionData.ImageAlign = align;
    console.debug(`Updating image alignment...`);
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => {
        console.debug(`Updated image alignment.`)
        updatePageSection(pageSectionData);
      })
      .catch(error => showErrorAlert(`Error updating image alignment.`, error));
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
        updatePageSection(pageSectionData);
      })
      .catch(error => showErrorAlert(`Error updating image position.`, error));

  }

  function hideImageFrame(hide) {
    pageSectionData.HideImageFrame = hide;
    console.debug(`Updating image frame...`);
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => {
        console.debug(`Updated image frame.`)
        updatePageSection(pageSectionData);
      })
      .catch(error => showErrorAlert(`Error updating image frame.`, error));
  }

  function deleteImage() {
    console.debug(`Deleting section image...`);
    PageSections.deleteSectionImage(pageSectionData.PageID, pageSectionData.PageSectionID)
      .then(() => {
        console.debug(`Deleted section image.`)
        pageSectionData.SectionImage = null;
        updatePageSection(pageSectionData);
      })
      .catch(error => showErrorAlert(`Error deleting section image.`, error));
  }

  function setImageWidth(width) {
    console.debug(`Setting image width to ${width}...`);
    pageSectionData.ImageWidth = width;
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => {
        console.debug(`Updated image width.`)
        updatePageSection(pageSectionData);
      }).catch(error => showErrorAlert(`Error updating image width.`, error));
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
  let imageDivClassName = 'SectionImage mb-3 col-12';
  const imageStyle = {};
  let imageClassName = 'img-fluid';
  if (pageSectionData.ImagePosition === 'beside') {
    // align image left or right beside text
    imageDivClassName += ` col-sm-${getImageWidth()}`;
    imageDivStyle.position = 'relative';
    imageDivStyle.float = pageSectionData.ImageAlign;
    imageDivStyle.textAlign = 'center';
    if (pageSectionData.ImageAlign === 'right') {
      imageDivClassName += ' ms-sm-3';
    } else if (pageSectionData.ImageAlign === 'left') {
      imageDivClassName += ' me-sm-4';
    }
  } else {
    // center image
    imageDivClassName += ` col-sm-12`;
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
            <FileDropTarget ref={dropRef} onFileSelected={onFileSelected} onFilesSelected={onFilesSelected}/>
            <div
              className="dropdown"
              style={{position: 'absolute', bottom: '0', right: '2px'}}
            >
              <Button
                variant="secondary"
                size="sm"
                style={{
                  border: 'none',
                  boxShadow: 'none',
                  margin: '2px',
                  padding: '2px 5px'
                }}
                className={`border btn-light`}
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