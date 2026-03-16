import {useSiteContext} from "./Site";
import FileDropTarget, {DropState} from "../editor/FileDropTarget";
import {useRef} from "react";
import {useTouchContext} from "../../util/TouchProvider";
import PageSectionImageMenu from "./PageSectionImageMenu";
import {motion, useScroll, useTransform} from 'motion/react';
import {usePageContext} from "./Page";

/**
 * Display a page section image.
 *
 * Should be inserted before section text if position is "above",
 * otherwise it should be inserted after the section text.
 *
 * @property {PageSectionData} pageSectionData    Data for entire page section.
 * @property {Ref<HTMLImageElement>} imageRef     Returns a reference to the image tag.
 * @property {function(File)} onFileSelected      Callback when a file is dropped.
 * @property {function(File[])} onFilesSelected   Callback when multiple files are dropped.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function PageSectionImage(
  {
    pageSectionData,
    imageRef,
    dropRef,
    onFileSelected,
    onFilesSelected,
    canEdit = false
  }) {

  // imports
  const {supportsHover} = useTouchContext();
  const {siteData, showErrorAlert} = useSiteContext();
  const {scrollRef} = usePageContext();


  // refs
  const editButtonRef = useRef(null);

  // scroll calculation for parallax
  const {scrollYProgress} = useScroll({container: scrollRef, target: imageRef, offset: ["start end", "end start"]});
  const y = useTransform(scrollYProgress, [0, 1], ['0', '100%']);

  if (!pageSectionData.SectionImage) {
    return <></>;
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
    <>
      {pageSectionData.ImagePosition === 'parallax' ? (
        <div
          style={{position: 'relative'}}
          ref={imageRef}
          onMouseOver={() => {
            if (canEdit && supportsHover) editButtonRef.current.hidden = false;
          }}
          onMouseLeave={() => {
            if (canEdit && supportsHover) editButtonRef.current.hidden = true;
          }}>
          <motion.div
            className={`SectionImage col-sm-12 mb-3 parallax`}
            style={{
              width: '100%',
              paddingBottom: '50%',
              backgroundSize: 'cover',
              backgroundPositionX: 'center',
              backgroundPositionY: y,
              backgroundRepeat: 'no-repeat',
              backgroundImage: `url(${siteData?.SiteRootUrl}/images/${pageSectionData.SectionImage})`,
            }}
            onMouseOver={() => {
              if (canEdit && supportsHover) editButtonRef.current.hidden = false;
            }}
            onMouseLeave={() => {
              if (canEdit && supportsHover) editButtonRef.current.hidden = true;
            }}
          />
          {canEdit && (<>
            <FileDropTarget
              ref={dropRef}
              onFileSelected={onFileSelected}
              onFilesSelected={onFilesSelected}
              onError={(err) => {
                showErrorAlert(err);
                dropRef.current.setDropState(DropState.HIDDEN);
              }}
            />
            <PageSectionImageMenu pageSectionData={pageSectionData} buttonRef={editButtonRef}/>
          </>)}
        </div>) : (<>
        {pageSectionData?.SectionImage && (
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
              alt={pageSectionData.SectionImageDescription}
              data-testid={`SectionImage-${pageSectionData.PageSectionID}`}
              ref={imageRef}
            />

            {canEdit && (<>
              <FileDropTarget
                ref={dropRef}
                onFileSelected={onFileSelected}
                onFilesSelected={onFilesSelected}
                onError={(err) => {
                  showErrorAlert(err);
                  dropRef.current.setDropState(DropState.HIDDEN);
                }}
              />
              <PageSectionImageMenu pageSectionData={pageSectionData} buttonRef={editButtonRef}/>
            </>)}
          </div>
        )}
      </>)}
    </>);
}