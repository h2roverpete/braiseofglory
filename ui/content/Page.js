import {createContext, lazy, Suspense, useCallback, useContext, useEffect, useState} from "react";
import {useSiteContext} from "./Site";
import {useRestApi} from "../../api/RestApi";
import FormEditor from "../editor/FormEditor";
import {useEdit} from "../editor/EditProvider"

const AddExtrasModal = lazy(() => import("../extras/AddExtrasModal"));

export const PageContext = createContext(
  {}
);

/**
 * Page component.
 * Generates a container <div> for styling and display.
 * Provides page related data in a PageContext to children.
 *
 * @property {[JSX.Element]} children   Child elements.
 * @property {number} [pageId]          Specific page ID to display.
 * @property {Error} [error]            Display error instead of page content.
 * @property {boolean} [login]          User is logging in or out.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function Page({children, pageId, error, login}) {

  // imports
  const {canEdit} = useEdit();
  const {outlineData} = useSiteContext();
  const {Pages, Extras} = useRestApi();

  // states
  const [breadcrumbs, setBreadcrumbs] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [showAddExtraModal, setShowAddExtraModal] = useState(false);
  const [extraPageSectionId, setExtraPageSectionId] = useState(0);
  const [extras, setExtras] = useState([]);

  useEffect(() => {
    if (pageId && outlineData) {
      if (outlineData) {
        for (const page of outlineData) {
          if (page.PageID === pageId) {
            setPageData(page);
            console.debug(`Loaded page ${pageId} data.`);
            break;
          }
        }
      }
    }
  }, [pageId, outlineData]);

  useEffect(() => {
    // load page sections
    Pages.getPageSections(pageId).then((data) => {
      console.debug(`Loaded page ${pageId} sections.`);
      setSectionData(data); // update state
    })

  }, [pageId, Pages]);

  useEffect(() => {
    if (extras.length === 0) {
      // load extras
      Extras.getPageExtras(pageId).then((data) => {
        console.debug(`Loaded page ${pageId} extras: ${JSON.stringify(data)}`);
        setExtras(data); // update state
      })
    }
  }, [Extras, pageId, setExtras]);

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
    newSectionData.Created = new Date().toISOString();
    newSectionData.Modified = new Date().toISOString();
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
        // copy the data to insure replacement
        // add modification timestamp so key is changed
        newSections.push({...newData, Modified: new Date().toISOString()});
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
        login: login === true,
        error: error,
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
      <div className="Page" data-testid="Page">
        {children}
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
  return breadcrumbs.reverse();
}

export function usePageContext() {
  return useContext(PageContext)
}