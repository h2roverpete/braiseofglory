import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import ReactGA from 'react-ga4';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import {Route, Routes, useNavigate} from "react-router";
import {useRestApi} from "../../api/RestApi";
import Logout from '../../auth/Logout';
import {useEdit} from "../editor/EditProvider";
import SiteEditor from "../editor/SiteEditor";

/**
 * @typedef ErrorData
 *
 * @property {String} title
 * @property {String} description
 */

export const SiteContext = createContext({});

/**
 * @typedef SiteProps
 *
 * @property {string} googleId            ID for Google tracking tag.
 * @property {JSX.Element} pageElement    Element to use for displaying page contents.
 * @property {[JSX.Element]} children     Child elements.
 */

/**
 * Main container element of content framework.
 * Performs routing for page rendering.
 * Provides SiteContext to child elements.
 *
 * @param props {SiteProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function Site(props) {

  useMemo(() => {
    // Google Analytics, if provided.
    if (props.googleId || process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      ReactGA.initialize(props.googleId ? props.googleId : process.env.REACT_APP_GOOGLE_CLIENT_ID);
    }
    return true;
  }, [props.googleId]);

  const [siteData, setSiteData] = useState(null);
  const [outlineData, setOutlineData] = useState(null);
  const [error, __setError__] = useState(null); // use public setter, not __setError__
  const navigate = useNavigate();
  const {Sites} = useRestApi();
  const {canEdit} = useEdit();

  /**
   * Display the site in an error state.
   * @param {ErrorData} errorData
   */
  const setError = useCallback((errorData) => {
    // use stringify for deep compare
    if (JSON.stringify(errorData) !== JSON.stringify(error)) {
      __setError__(errorData);
      if (errorData) {
        // if setting non-null error, then redirect navigation
        navigate('/error');
      }
    }
  }, [navigate, error]);

  // set error from props if defined
  useEffect(() => {
    if (props.error) {
      setError(props.error)
    }
  }, [props.error, setError]);

  /**
   * Retrieve child pages of the specified page.
   *
   * @param pageId {number}         Page ID to get children from.
   * @param [showHidden] {boolean}  Return hidden pages? (default=false)
   * @returns {[OutlineData]}       Children, or an empty array if no child pages.
   */
  function getChildren(pageId, showHidden) {
    const result = [];
    if (outlineData) {
      outlineData.map((item) => {
        if (item.ParentID === pageId && ((!item.PageHidden) || showHidden)) {
          result.push(item);
        }
        return item;
      })
    }
    return result;
  }

  useEffect(() => {
    // load site data
    Sites.getSite().then((data) => {
      console.debug(`Loaded site ${data.SiteID}.`);
      setSiteData(data);
    }).catch(err => console.error(`Error loading site.`, err));
  }, []);

  useEffect(() => {
    // load site outline
    Sites.getSiteOutline().then((data) => {
      console.debug(`Loaded site outline.`);
      setOutlineData(data);
    }).catch(err => console.error(`Error loading outline.`, err));
  }, []);

  let redirect;
  if (props.redirects && window.location.pathname === '/') {
    // search for page redirect matches
    for (const item of props.redirects) {
      if (item.hostname === window.location.hostname) {
        console.debug(`Redirecting ${item.hostname} to page ${item.pageId}.`);
        redirect = item;
      }
    }
  }

  const params = new URLSearchParams(window.location.search);
  let cfmPageId = parseInt(params.get('pageid'));

  /**
   * Refresh a page in the site outline.
   * @param {PageData} pageData
   */
  function updateOutlineData(pageData) {
    if (outlineData) {
      const newOutlineData = [];
      outlineData.map((item) => {
        newOutlineData.push(item);
        if (item.PageID === pageData.PageID) {
          item.PageTitle = pageData.PageTitle;
          item.NavTitle = pageData.NavTitle;
          item.PageHidden = pageData.PageHidden;
        }
        return item;
      })
      setOutlineData(buildOutline(newOutlineData));
    }
  }

  function deletePageFromOutline(pageId) {
    if (outlineData) {
      const newOutlineData = [];
      outlineData.map((item) => {
        if (item.PageID !== pageId) {
          newOutlineData.push(item);
        }
        return item;
      })
      setOutlineData(buildOutline(newOutlineData));
    }
  }

  function addPageToOutline(pageData) {
    if (outlineData && pageData) {
      console.debug(`Add page ${pageData.PageID} to outline.`)
      const newOutlineData = [...outlineData, pageData];
      setOutlineData(buildOutline(newOutlineData));
    } else {
      console.error(`Can't add page to outline. Outline or page data are null.`);
    }
  }

  function movePageBefore(pageData, beforePageData) {
    console.debug(`Move page '${pageData.PageTitle} (${pageData.ParentID},${pageData.OutlineSeq})' before '${beforePageData.PageTitle} (${beforePageData.ParentID},${beforePageData.OutlineSeq})'`);
    const newOutlineData = outlineData.map((item) => {
      if (item.PageID === pageData.PageID) {
        const changedItem = {...item};
        changedItem.OutlineSeq = beforePageData.OutlineSeq;
        changedItem.ParentID = beforePageData.ParentID;
        changedItem.OutlineLevel = beforePageData.OutlineLevel;
        return changedItem;
      } else if (item.ParentID === beforePageData.ParentID && item.OutlineSeq >= beforePageData.OutlineSeq) {
        // increment outline sequence
        const changedItem = {...item};
        changedItem.OutlineSeq++;
        return changedItem;
      } else {
        // no change
        return item;
      }
    });
    setOutlineData(buildOutline(newOutlineData));
  }

  function movePageAfter(pageData, afterPageData) {
    console.debug(`Move page '${pageData.PageTitle} (${pageData.ParentID},${pageData.OutlineSeq})' after '${afterPageData.PageTitle} (${afterPageData.ParentID},${afterPageData.OutlineSeq})'`);
    const newOutlineData = outlineData.map((item) => {
      if (item.PageID === pageData.PageID) {
        const changedItem = {...item};
        changedItem.OutlineSeq = afterPageData.OutlineSeq + 1;
        changedItem.ParentID = afterPageData.ParentID;
        changedItem.OutlineLevel = afterPageData.OutlineLevel;
        return changedItem;
      } else if (item.ParentID === afterPageData.ParentID && item.OutlineSeq > afterPageData.OutlineSeq) {
        // increment outline sequence
        const changedItem = {...item};
        changedItem.OutlineSeq++;
        return changedItem;
      } else {
        // no change
        return item;
      }
    });
    setOutlineData(buildOutline(newOutlineData));
  }

  function makeChildOf(pageData, parentPageData) {
    console.debug(`Make page '${pageData.PageTitle} (${pageData.ParentID},${pageData.OutlineSeq})' child of '${parentPageData.PageTitle} (${parentPageData.ParentID},${parentPageData.OutlineSeq})'`);
    const newOutlineData = outlineData.map((item) => {
      if (item.PageID === pageData.PageID) {
        const changedItem = {...item};
        changedItem.OutlineSeq = 1;
        changedItem.ParentID = parentPageData.PageID;
        changedItem.OutlineLevel = parentPageData.OutlineLevel + 1;
        return changedItem;
      } else if (item.ParentID === parentPageData.PageID) {
        // increment outline sequence
        const changedItem = {...item};
        changedItem.OutlineSeq++;
        return changedItem;
      } else {
        // no change
        return item;
      }
    });
    setOutlineData(buildOutline(newOutlineData));
  }

  /**
   * Build or rebuild the site outline in the proper sequence
   * from an unsorted array of page data.
   *
   * @param pages {[OutlineData]}   Array of page data (arbitrary sort order)
   * @param [parentId] {number}     Parent page ID.
   * @param [level] {number}        Level number, also a trigger to recurse through all children.
   * @param [parent] {OutlineData}  Parent's sort string
   * @returns {[OutlineData]}       Outline built from page data
   */
  function buildOutline(pages, parentId, level, parent) {
    parentId = parentId ? parentId : 0;
    level = level ? level : 0;
    let result = [];
    pages.map((page) => {
      if (page.ParentID === parentId) {
        // copy outline data fields
        const child = {
          PageID: page.PageID,
          SiteID: page.SiteID,
          ParentID: page.ParentID,
          PageTitle: page.PageTitle,
          DisplayTitle: page.DisplayTitle,
          PageHidden: page.PageHidden,
          NavTitle: page.NavTitle,
          OutlineSeq: page.OutlineSeq,
          LinkToURL: page.LinkToURL,
          HasChildren: page.HasChildren,
          PageRoute: page.PageRoute,
          Modified: page.Modified,
          OutlineLevel: level,
          OutlineSort: setCharAt(parent ? parent.OutlineSort : '0'.repeat(20), level * 2, page.OutlineSeq.toString().padStart(2, "0"))
        }
        result.push(child);
        result = result.concat(buildOutline(pages, child.PageID, level + 1, child));
      }
    })
    result.sort((a, b) => a.OutlineSort.localeCompare(b.OutlineSort));
    return result;
  }

  function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
  }

  const siteElements = (
    <Routes>
      <Route
        path="/login"
        element={<props.pageElement login={true}/>
        }
      />
      <Route
        path="/logout"
        element={<Logout/>}
      />
      <>{error && (
        // error page display
        <Route
          path="/error"
          element={<props.pageElement error={error}/>
          }
        />
      )}</>
      <>{outlineData && (
        <>
          <>{cfmPageId && (
            // legacy coldfusion page
            <Route
              path="/page.cfm"
              element={<props.pageElement pageId={cfmPageId}/>}
            />
          )}</>
          <>{redirect ? (
            // redirect root for an alternate domain
            <Route
              path="/"
              element={<props.pageElement pageId={redirect.pageId}/>}
            />
          ) : (
            // normal root, first item in outline
            <Route
              path="/"
              element={<props.pageElement pageId={outlineData[0].PageID}/>}
            />
          )}</>
          {outlineData.map((page) => (
            // all pages in site outline
            <Route
              path={page.PageRoute}
              element={<props.pageElement pageId={page.PageID}
              />}
            />
          ))}
          {/* catchall to display 404 errors when route not matched */}
          <Route
            path="*"
            element={<props.pageElement
              error={{
                title: "404 Not Found",
                description: "The content you are looking for was not found. Please select a topic on the navigation bar to browse the site."
              }}/>}
          />
        </>
      )}</>
      {props.children}
    </Routes>

  )

  const siteContext = {
    siteData: siteData,
    setSiteData: setSiteData,
    Outline: {
      deletePage: deletePageFromOutline,
      addPage: addPageToOutline,
      movePageBefore: movePageBefore,
      movePageAfter: movePageAfter,
      makeChildOf: makeChildOf,
      updatePage: updateOutlineData,
    },
    outlineData: outlineData,
    error: error,
    setError: setError,
    getChildren: getChildren
  };

  if (canEdit) {
    return (
      <SiteContext value={siteContext}>
        <SiteEditor>
          <div className="Site" data-testid="Site">
            {siteElements}
          </div>
        </SiteEditor>
      </SiteContext>
    );
  } else {
    return (
      <SiteContext value={siteContext}>
        <div className="Site" data-testid="Site">
          {siteElements}
        </div>
      </SiteContext>
    );
  }
}

export function useSiteContext() {
  return useContext(SiteContext)
}