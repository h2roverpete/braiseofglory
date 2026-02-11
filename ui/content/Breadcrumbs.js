import {useContext} from "react";
import {PageContext} from "./Page";
import {SiteContext} from "./Site";

/**
 * @typedef BreadcrumbProps
 * @property {string} [delimiter]   Delimiter to use between pages.
 */
/**
 * Display breadcrumb trail in site navigation.
 *
 * @param props {BreadcrumbProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function Breadcrumbs(props) {

  const {siteData} = useContext(SiteContext);
  const {breadcrumbs} = useContext(PageContext);

  return (<>{breadcrumbs?.length > 0 && (
    <div className="Breadcrumbs">
      {siteData?.SiteName}
      <>&nbsp;&raquo;&nbsp;</>
      {breadcrumbs.map(page => (
        <span key={page.PageID}>
          {page.NavTitle ? page.NavTitle : page.PageTitle}
          <>{props.delimiter ? (
            <>{props.delimiter}</>
          ) : (
            <>&nbsp;&raquo;&nbsp;</>
          )}</>
        </span>
      ))}
    </div>
  )}</>);
}
