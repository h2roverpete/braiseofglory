import PageSection from './PageSection';
import React, {Fragment, useEffect} from "react";
import {usePageContext} from "./Page";
import Login from "../../auth/Login";
import {useEdit} from "../editor/EditProvider";

/**
 * @typedef PageSectionProps
 * @property {[JSX.Element]} children
 */
/**
 * Element to show page content
 *
 * A <div> element with class names "content container"
 *
 * @param props {PageSectionProps}
 * @constructor
 */
export default function PageSections(props) {
  const {pageData, sectionData, error, login} = usePageContext();

  const {canEdit} = useEdit();
  useEffect(() => {
    if (canEdit) {
      // attach drag and drop related window scripts
      window.addEventListener("drop", windowDropHandler);
    }
  }, [canEdit]);

  function windowDropHandler(e) {
    if ([...e.dataTransfer.items].some((item) => item.kind === "file")) {
      e.preventDefault();
    }
  }

  return (
    <>{error ? (
      <div className={'PageSection'} dangerouslySetInnerHTML={{__html: error.description}}></div>
    ) : (<>
      {login ? (<>
        <Login/>
      </>) : (<>
        {pageData && sectionData && (<>
          {sectionData.map(section => (<Fragment key={hash(section.PageSectionID+section.SectionText+section.SectionTitle+section.SectionImage+section.TitleAlign+section.TextAlign)}>
            <PageSection
              pageSectionData={section}
              data-testid={`PageSection-section.PageSectionID`}/>
          </Fragment>))}
          {props.children}
        </>)}
      </>)}
    </>)}
    </>)
}

function hash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    // Equivalent to `hash * 31 + char`, optimized with bitwise shift operations
    hash = (hash << 5) - hash + char;
    // Convert to a 32-bit integer
    hash |= 0;
  }
  return hash;
}