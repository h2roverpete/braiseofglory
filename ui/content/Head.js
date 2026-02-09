import {useContext} from "react";
import {PageContext} from "./Page";
import {SiteContext} from "./Site";

/**
 * @typedef HeadProps
 * @property {ErrorData} error
 */

/**
 * Element to display elements in page head.
 * Needs to be a child of the <Page> tag.
 *
 * Uses Helmet to propagate data to the <head> elements.
 *
 * @param props {HeadProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function Head(props) {

  const {pageData, error} = useContext(PageContext);
  const {siteData} = useContext(SiteContext);

  const title = pageData && siteData ? pageData.PageMetaTitle ? pageData.PageMetaTitle : `${siteData.SiteName} - ${pageData.PageTitle}` : `Loading...`;

  return (
    <>{error ? (
      <>
        <title>{error.title}</title>
        <meta name="description" content={error.description}/>
      </>
    ) : (
      <>
        {pageData && (<>
          <title>{title}</title>
          <meta name="description" content={pageData.PageMetaDescription}/>
          <meta name="keywords" content={pageData.PageMetaKeywords}/>
        </>)}
      </>
    )}</>
  )
}