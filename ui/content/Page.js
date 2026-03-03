import {createContext, lazy, Suspense, useCallback, useContext, useEffect, useState} from "react";
import {useSiteContext} from "./Site";
import {useRestApi} from "../../api/RestApi";
import FormEditor from "../editor/FormEditor";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";

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
  const {outlineData, buildBreadcrumbs} = useSiteContext();
  const {Pages, Extras} = useRestApi();
  const {hasPermission} = useAuth();

  // states
  const [breadcrumbs, setBreadcrumbs] = useState(/** @type {OutlineData[]} */ null);
  const [pageData, setPageData] = useState(/** @type {PageData} */null);
  const [sectionData, setSectionData] = useState(/** @type {PageSectionData[]} */ null);
  const [showAddExtraModal, setShowAddExtraModal] = useState(false);
  const [extraPageSectionId, setExtraPageSectionId] = useState(0);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.PAGE, Permission.EDIT));
  }, [setCanEdit, hasPermission]);

  useEffect(() => {
    // extract this page from outline data, don't load from DynamoDB
    if (pageId !== pageData?.PageID && outlineData) {
      for (const page of outlineData) {
        if (page.PageID === pageId) {
          setPageData(page);
          console.debug(`Loaded page ${pageId} data.`);
          break;
        }
      }
    }
  }, [pageId, pageData, outlineData]);

  useEffect(() => {
    // load page sections from DynamoDB
    if (pageId && pageId !== pageData?.PageID) {
      Pages.getPageSections(pageId).then((sections) => {
        console.debug(`Loaded page ${pageId} sections.`);
        Extras.getPageExtras(pageId).then((extras) => {
          console.debug(`Loaded page ${pageId} extras.`);
          sections.forEach((section) => {
            section.Extras = extras.filter((extra) => extra.PageSectionID === section.PageSectionID);
          })
          // set new page content
          setSectionData(sections);
        })
      })
      // clear page until data loads
      setSectionData([]);
    }
  }, [pageId, pageData, Pages, sectionData, Extras]);

  useEffect(() => {
    // build breadcrumbs at the page level for slider pages
    if (!breadcrumbs && pageData && outlineData) {
      // build breadcrumb data
      setBreadcrumbs(buildBreadcrumbs(outlineData, pageData.ParentID));
    }
  }, [pageData, outlineData, breadcrumbs, buildBreadcrumbs]);

  const addPageSection = useCallback((newData) => {
    /** @type {PageSectionData[]} */
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

  const addExtraToPage = useCallback((extra) => {
    sectionData.forEach((section, sectionIndex) => {
      if (section.PageSectionID === extra.PageSectionID) {
        // update section data
        if (!section.Extras) {
          section.Extras = [];
        }
        section.Extras.push(extra);
        section.Modified = new Date().toISOString();
        sectionData[sectionIndex] = {...section};
      }
    })
    setSectionData([...sectionData]);
  }, [setSectionData, sectionData]);

  const removeExtraFromPage = useCallback((extraId) => {
    sectionData.forEach((section, sectionIndex) => {
      const extras = section.Extras?.filter((extra) => extra.ExtraID !== extraId);
      if (extras && extras.length < section.Extras?.length) {
        // update section data
        section.Extras = extras;
        section.Modified = new Date().toISOString();
        sectionData[sectionIndex] = {...section};
      }
    })
    setSectionData([...sectionData]);
  }, [sectionData, setSectionData]);

  const updateExtra = useCallback((newExtra) => {
    sectionData.forEach((section, sectionIndex) => {
      section.Extras?.forEach((extra, extraIndex) => {
        if (extra.ExtraID === newExtra.ExtraID) {
          // update section data
          section.Extras[extraIndex] = ({...newExtra});
          section.Modified = new Date().toISOString();
          sectionData[sectionIndex] = {...section};
        }
      })
    })
    setSectionData([...sectionData]);
  }, [sectionData, setSectionData]);

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

export function usePageContext() {
  return useContext(PageContext)
}