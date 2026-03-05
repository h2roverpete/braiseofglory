import {Button} from "react-bootstrap";
import {BsArrowsMove} from "react-icons/bs";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "./Page";
import {useSiteContext} from "./Site";
import {useTouchContext} from "../../util/TouchProvider";

export default function PageSectionImageMenu({pageSectionData, buttonRef}) {

  const {PageSections} = useRestApi();
  const {updatePageSection} = usePageContext();
  const {supportsHover} = useTouchContext();
  const {siteData, showErrorAlert} = useSiteContext();

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

  function getImageWidth() {
    if (pageSectionData) {
      return pageSectionData.ImageWidth > 0 ? pageSectionData.ImageWidth : pageSectionData.ImagePosition === 'beside' ? 7 : 'auto';
    } else {
      return 'auto';
    }
  }

  return (
    <div
      className="EditSectionImage Editor dropdown"
      ref={buttonRef}
      hidden={supportsHover}
    >
      <Button
        variant={siteData?.SiteTheme}
        size="sm"
        className={`EditButton EditImageButton`}
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
        {pageSectionData.ImagePosition !== 'parallax' && (
          <span className="dropdown-item" onClick={() => setImagePosition('parallax')}>Parallax</span>)}
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
  )
}