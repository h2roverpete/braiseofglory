import {createContext, lazy, Suspense, useCallback, useContext, useEffect, useState} from "react";
import {SiteContext} from "./Site";
import {useRestApi} from "../../api/RestApi";
import PageConfigPanel from "../editor/PageConfigPanel";
import FormEditor from "../editor/FormEditor";
import {useEdit} from "../editor/EditProvider"

const AddExtrasModal = lazy(() => import("../extras/AddExtrasModal"));

export const PageContext = createContext(
  {}
);

/**
 * @typedef PageProps
 *
 * @property {[JSX.Element]} children   Child elements.
 * @property {number} [pageId]          Specific page ID to display.
 * @property {ErrorData} [error]        Error information to display.
 * @property {boolean} [login]          User is logging in or out.
 */

/**
 * Page component.
 * Generates a container <div> for styling and display.
 * Provides page related data in a PageContext to children.
 *
 * @param props {PageProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function Page(props) {

  const {outlineData, error} = useContext(SiteContext);
  const [pageData, setPageData] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState(null);
  const {Pages, Extras} = useRestApi();
  const [showAddExtraModal, setShowAddExtraModal] = useState(false);
  const [extraPageSectionId, setExtraPageSectionId] = useState(0);
  const [extras, setExtras] = useState([]);
  const {canEdit} = useEdit();

  let errorData;
  if (error) {
    // pass error from site context
    errorData = error;
  } else if (props.error) {
    // pass error from props
    errorData = props.error;
  }

  useEffect(() => {
    if (props.pageId) {
      // load page data
      Pages.getPage(props.pageId).then((data) => {
        console.debug(`Loaded page ${props.pageId} data.`);
        setPageData(data); // update state
      })
    }
  }, [props.pageId, Pages]);

  useEffect(() => {
    if (pageData) {
      // load page sections
      Pages.getPageSections(pageData.PageID).then((data) => {
        console.debug(`Loaded page ${pageData.PageID} sections.`);
        setSectionData(data); // update state
      })
      // load extras
      Extras.getPageExtras(pageData.PageID).then((data) => {
        console.debug(`Loaded page ${pageData.PageID} extras: ${JSON.stringify(data)}`);
        setExtras(data); // update state
      })
    }
  }, [pageData, Extras, Pages]);

  useEffect(() => {
    if (pageData && outlineData) {
      // build breadcrumb data
      setBreadcrumbs(buildBreadcrumbs(outlineData, pageData.ParentID)); // update state
    } else {
      setBreadcrumbs([]);
    }
  }, [pageData, outlineData])

  const addPageSection = useCallback((newData) => {
    const newSectionData = [...sectionData, newData]
    newSectionData.sort((a, b) => a.PageSectionSeq - b.PageSectionSeq);
    setSectionData(newSectionData);
  }, [sectionData, setSectionData]);

  const deletePageSection = useCallback((pageSectionId) => {
    const newSections = [];
    for (const section of sectionData) {
      if (section.PageSectionID !== pageSectionId) {
        newSections.push(section);
      }
    }
    setSectionData(newSections);
  }, [sectionData, setSectionData]);

  const updatePageSection = useCallback((newData) => {
    const newSections = [];
    for (const section of sectionData) {
      if (section.PageSectionID === newData.PageSectionID) {
        newSections.push(newData);
      } else {
        newSections.push(section);
      }
    }
    newSections.sort((a, b) => a.PageSectionSeq - b.PageSectionSeq);
    setSectionData(newSections);
  }, [sectionData, setSectionData]);

  const addExtraToPage = useCallback((data) => {
    setExtras([
      ...extras,
      data
    ]);
  }, [extras, setExtras]);

  const removeExtraFromPage = useCallback((extraId) => {
    const newExtras = [];
    for (const extra of extras) {
      if (extra.ExtraID !== extraId) {
        newExtras.push(extra);
      }
    }
    setExtras(newExtras);
  }, [extras, setExtras]);

  const updateExtra = useCallback((data) => {
    const newExtras = [];
    for (const extra of extras) {
      if (extra.ExtraID === data.ExtraID) {
        newExtras.push(data);
      } else {
        newExtras.push(extra);
      }
    }
    setExtras(newExtras);
  }, [extras, setExtras]);

  const addExtraModal = useCallback(({pageSectionId}) => {
    setShowAddExtraModal(true);
    setExtraPageSectionId(pageSectionId);
  }, [setShowAddExtraModal, setExtraPageSectionId]);

  // provide context to children
  return (
    <PageContext
      value={{
        pageData: pageData,
        sectionData: sectionData,
        pageExtras: extras,
        breadcrumbs: breadcrumbs,
        login: props.login === true,
        error: errorData,
        setPageData: setPageData,
        setSectionData: setSectionData,
        updatePageSection: updatePageSection,
        addPageSection: addPageSection,
        deletePageSection: deletePageSection,
        addExtraModal: addExtraModal,
        addExtraToPage: addExtraToPage,
        removeExtraFromPage: removeExtraFromPage,
        updateExtra: updateExtra,
      }}
    >
      {canEdit && showAddExtraModal && (
        <FormEditor>
          <Suspense fallback={<></>}>
            <AddExtrasModal
              show={showAddExtraModal}
              onHide={() => setShowAddExtraModal(false)}
              pageSectionId={extraPageSectionId}
            />
          </Suspense>
        </FormEditor>
      )}
      {canEdit && (
        <PageConfigPanel/>
      )}
      <div className="Page" data-testid="Page">
        {props.children}
      </div>
    </PageContext>
  );
}

/**
 * Build breadcrumb array from site outline.
 *
 * @param outlineData {[OutlineData]}
 * @param parentId {number}
 */
function buildBreadcrumbs(outlineData, parentId) {
  const breadcrumbs = [];
  if (outlineData && parentId) {
    for (let i = outlineData.length - 1; i >= 0; i--) {
      if (outlineData[i].PageID === parentId) {
        breadcrumbs.push(outlineData[i]);
        parentId = outlineData[i].ParentID;
      }
    }
  }
  return breadcrumbs.sort((a, b) => {
    return b?.OutlineSeq - a?.OutlineSeq
  });
}

export function usePageContext() {
  return useContext(PageContext)
}