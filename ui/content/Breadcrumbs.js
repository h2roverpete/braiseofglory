import {useContext} from "react";
import {PageContext} from "./Page";
import {SiteContext} from "./Site";

/**
 * Display breadcrumb trail in site navigation.
 *
 * @property {string} [delimiter]   Delimiter to use between pages.
 * @returns {JSX.Element}
 * @constructor
 */
export default function Breadcrumbs({delimiter}) {

  const {siteData} = useContext(SiteContext);
  const {breadcrumbs} = useContext(PageContext);

  return (<>{breadcrumbs?.length > 0 && (
    <div className="Breadcrumbs">
      {siteData?.SiteName}
      <>&nbsp;&raquo;&nbsp;</>
      {breadcrumbs.map(page => (
        <span key={page.PageID}>
          {page.NavTitle ? page.NavTitle : page.PageTitle}
          <>{delimiter ? (
            <>{delimiter}</>
          ) : (
            <>&nbsp;&raquo;&nbsp;</>
          )}</>
        </span>
      ))}
    </div>
  )}</>);
}
