import {useSiteContext} from "./Site";
import {usePageContext} from "./Page";

/**
 * Display breadcrumb trail in site navigation.
 *
 * @property {string} [delimiter]   Delimiter to use between pages.
 * @returns {JSX.Element}
 * @constructor
 */
export default function Breadcrumbs({delimiter}) {

  const {siteData} = useSiteContext();
  const {breadcrumbs, error, login} = usePageContext();

  return (<>{breadcrumbs?.length > 0 && !error && !login && (
    <ol className="breadcrumb">
      {siteData?.SiteName}
      <>&nbsp;&raquo;&nbsp;</>
      {breadcrumbs.map(page => (
        <li key={page.PageID} className="breadcrumb-item">
          {page.NavTitle ? page.NavTitle : page.PageTitle}
          <>{delimiter ? (
            <>{delimiter}</>
          ) : (
            <>&nbsp;&raquo;&nbsp;</>
          )}</>
        </li>
      ))}
    </ol>
  )}</>);
}
