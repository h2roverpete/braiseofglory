import {Button} from "react-bootstrap";
import {BsPlus} from "react-icons/bs";
import React, {lazy, Suspense, useState} from "react";
import FormEditor from "./FormEditor";
import {useTouchContext} from "../../util/TouchProvider";
import {usePageContext} from "../content/Page";
import {useRestApi} from "../../api/RestApi";

const NewPageModal = lazy(() => import("../editor/NewPageModal"));

export default function AddPageMenu({editButtonRef}) {

  // imports
  const {supportsHover} = useTouchContext();
  const {pageData, addPageSection} = usePageContext();
  const {PageSections} = useRestApi();

  // states
  const [showNewPage, setShowNewPage] = useState(false);

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

  return (<div
    className="AddPageMenu Editor dropdown"
    style={{
      display: "flex",
      flexDirection: "column",
      zIndex: 100,
    }}
    ref={editButtonRef}
    hidden={supportsHover}
  >
    <Button
      className={`AddPageButton EditButton btn-light`}
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
        <span
          className="dropdown-item"
          onClick={() => setShowNewPage(true)}
        >
          New Page
        </span>
      <span
        className="dropdown-item"
        onClick={() => onAddSection()}
      >
        New Section
          </span>
    </div>
    {showNewPage && (<Suspense fallback={<></>}>
      <FormEditor>
        <NewPageModal show={showNewPage} setShow={setShowNewPage}/>
      </FormEditor>
    </Suspense>)}
  </div>)

}