import {useSiteContext} from "./Site";

/**
 * Element to display elements in page head.
 * Needs to be a child of the <Site> tag.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function Head() {

  const {siteData, error, currentPage} = useSiteContext();

  return (
    <>
      {siteData?.SiteStyle && (
        <link
          rel={'stylesheet'}
          href={`https://resources.h2rover.net/css/${siteData.SiteStyle}`}
        />
      )}
      {error ? (
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