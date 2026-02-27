import {useNavigate} from "react-router";
import {useSiteContext} from "./Site";
import {Button} from "react-bootstrap";

/**
 * Display next/previous page navigation elements.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function PageNavigation() {

  const {nextPage, prevPage} = useSiteContext();
  const navigate = useNavigate();

  return (
    <div
      className="PageNavigation nav-pills"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "end",
      }}
    >
      {prevPage && (
        <div
          className="nav nav-item nav-link"
          style={{cursor: "pointer"}}
          onClick={() => navigate(prevPage.PageRoute)}
        >
          <>&nbsp;&laquo;&nbsp;</>
          {prevPage.NavTitle ? prevPage.NavTitle : prevPage.PageTitle}
        </div>
      )}
      <span style={{flexGrow: 1}}></span>
      {
        nextPage && (
          <div
            className="nav nav-item nav-link"
            style={{cursor: "pointer"}}
            onClick={() => navigate(nextPage.PageRoute)}
          >
            {nextPage.NavTitle ? nextPage.NavTitle : nextPage.PageTitle}
            <>&nbsp;&raquo;&nbsp;</>
          </div>
        )
      }
    </div>
  )
}