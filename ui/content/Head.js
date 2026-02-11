import {useSiteContext} from "./Site";

/**
 * Element to display elements in page head.
 * Needs to be a child of the <Page> tag.
 *
 * Uses Helmet to propagate data to the <head> elements.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function Head() {

  const {siteData, error, currentPage} = useSiteContext();

  return (
    <>{error ? (
      <>
        <title>{error.title}</title>
        <meta name="description" content={error.description}/>
      </>
    ) : (
      <>
        {currentPage && siteData && (<>
          <title>{currentPage.PageMetaTitle ? currentPage.PageMetaTitle : `${siteData.SiteName} - ${currentPage.PageTitle}`}</title>
          <meta name="description" content={currentPage.PageMetaDescription}/>
          <meta name="keywords" content={currentPage.PageMetaKeywords}/>
        </>)}
      </>
    )}</>
  )
}