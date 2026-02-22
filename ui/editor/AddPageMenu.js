import {Button} from "react-bootstrap";
import {BsPlus} from "react-icons/bs";
import React, {lazy, Suspense, useEffect, useState} from "react";
import FormEditor from "./FormEditor";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";

const NewPageModal = lazy(() => import("../editor/NewPageModal"));

/**
 * Dropdown menu for adding a new page or page section.
 *
 * @param {RefObject<HTMLButtonElement>} [editButtonRef]  Receive a reference to the dropdown button div.
 *
 * @returns {Element}
 * @constructor
 */
export default function AddPageMenu({editButtonRef}) {

  // imports
  const {hasPermission} = useAuth();

  // states
  const [showNewPage, setShowNewPage] = useState(false);
  const [canEditSite, setCanEditSite] = useState(false);

  useEffect(() => {
    setCanEditSite(hasPermission?.(Resource.SITE, Permission.EDIT));
  }, [setCanEditSite, hasPermission]);

  return (<>
    {canEditSite && (<>
      <Button
        className={`AddPageButton EditButton btn-light`}
        variant="secondary"
        type="button"
        size={'sm'}
        aria-expanded="false"
        ref={editButtonRef}
        onClick={() => {
          setShowNewPage(true)
        }}>
        <BsPlus/>
      </Button>
      {showNewPage && (<Suspense fallback={<></>}>
        <FormEditor>
          <NewPageModal show={showNewPage} setShow={setShowNewPage}/>
        </FormEditor>
      </Suspense>)}
    </>)}
  </>);
}