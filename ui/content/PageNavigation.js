import {Link} from "react-router";
import {useSiteContext} from "./Site";

export default function PageNavigation() {

  const {nextPage, prevPage} = useSiteContext();

  return (
    <div
      className="PageNavigation"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "end",
      }}
    >
      {prevPage && (
        <Link to={prevPage.PageRoute}>
          <>&nbsp;&laquo;&nbsp;</>
          {prevPage.NavTitle ? prevPage.NavTitle : prevPage.PageTitle}
        </Link>
      )}
      <span style={{flexGrow: 1}}></span>
      {nextPage && (
        <Link to={nextPage.PageRoute}>
          {nextPage.NavTitle ? nextPage.NavTitle : nextPage.PageTitle}
          <>&nbsp;&raquo;&nbsp;</>
        </Link>
      )}
    </div>
  )
}