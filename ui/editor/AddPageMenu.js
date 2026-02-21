import {Button} from "react-bootstrap";
import {BsPlus} from "react-icons/bs";
import React, {lazy, Suspense, useEffect, useState} from "react";
import FormEditor from "./FormEditor";
import {useTouchContext} from "../../util/TouchProvider";
import {usePageContext} from "../content/Page";
import {useRestApi} from "../../api/RestApi";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";

const NewPageModal = lazy(() => import("../editor/NewPageModal"));

/**
 * Dropdown menu for adding a new page or page section.
 *
 * @param {RefObject<HTMLDivElement>} [editButtonRef]  Receive a reference to the dropdown button div.
 *
 * @returns {Element}
 * @constructor
 */
export default function AddPageMenu({editButtonRef}) {

  // imports
  const {supportsHover} = useTouchContext();
  const {pageData, addPageSection} = usePageContext();
  const {PageSections} = useRestApi();
  const {hasPermission} = useAuth();

  // states
  const [showNewPage, setShowNewPage] = useState(false);
  const [canEditPage, setCanEditPage] = useState(false);
  const [canEditSite, setCanEditSite] = useState(false);

  useEffect(() => {
    setCanEditSite(hasPermission?.(Resource.SITE, Permission.EDIT));
    setCanEditPage(hasPermission?.(Resource.PAGE, Permission.EDIT));
  }, [setCanEditPage, setCanEditSite, hasPermission]);

  function onAddSection() {
    if (pageData) {
      const data = {
        PageID: pageData.PageID
      }
      console.debug(`Adding page section...`);
      PageSections.insertOrUpdatePageSection(data)
        .then((section) => {
          addPageSection(section);
        }).catch((error) => {
        console.error(`Error adding page section.`, error);
      })
    }
  }

  return (<>
    {(canEditPage || canEditSite) && <div
      className="AddPageMenu Editor dropdown"
      ref={editButtonRef}
      hidden={supportsHover}
    >
      <Button
        className={`AddPageButton EditButton btn-light`}
        variant="secondary"
        type="button"
        size={'sm'}
        aria-expanded="false"
        data-bs-toggle="dropdown"
      >
        <BsPlus/>
      </Button>
      <div
        className="dropdown-menu dropdown-menu-end Editor"
      >
        {canEditSite && (
          <span
            className="dropdown-item"
            onClick={() => setShowNewPage(true)}
          >
          New Page
        </span>
        )}
        {canEditPage && (
          <span
            className="dropdown-item"
            onClick={() => onAddSection()}
          >
        New Section
          </span>
        )}
      </div>
      {showNewPage && (<Suspense fallback={<></>}>
        <FormEditor>
          <NewPageModal show={showNewPage} setShow={setShowNewPage}/>
        </FormEditor>
      </Suspense>)}
    </div>}
  </>);
}