import PageSection from './PageSection';
import React, {Fragment, useEffect, useState} from "react";
import {usePageContext} from "./Page";
import Login from "../../auth/Login";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";

/**
 * Element to show all the sections on a page
 *
 * A <div> element with class names "content container"
 *
 * @param props {PageSectionProps}
 * @constructor
 */
export default function PageSections({children}) {

  const {sectionData, login, error} = usePageContext();
  const {hasPermission} = useAuth();

  const [canEdit, setCanEdit] = useState(false);
  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.PAGE, Permission.EDIT));
  }, [setCanEdit, hasPermission]);

  useEffect(() => {
    if (canEdit) {
      // attach drag and drop related window scripts
      window.addEventListener("drop", windowDropHandler);
    }
  }, [canEdit]);

  function windowDropHandler(e) {
    if ([...e.dataTransfer.items].some((item) => item.kind === "file" || item.type.match("^text/uri-list"))) {
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
        {sectionData && (<>
          {sectionData.map(section => (<Fragment key={section.PageSectionID + "_" + section.Modified}>
            <PageSection
              pageSectionData={section}
              data-testid={`PageSection-section.PageSectionID`}
              canEdit={canEdit}
            />
          </Fragment>))}
          {children}
        </>)}
      </>)}
    </>)}
    </>)
}