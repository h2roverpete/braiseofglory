import {useEffect, useState} from "react";
import {useSiteContext} from "./Site";
import {usePageContext} from "./Page";
import {Link} from "react-router";

export default function PageNavigation() {

  const {outlineData} = useSiteContext();
  const {pageData} = usePageContext();
  const [next, setNext] = useState(null);
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    if (pageData && outlineData) {
      let before;
      let current;
      let after;
      for (const page of outlineData) {
        if (page.PageID === pageData.PageID) {
          current = page;
        } else if (current && !page.HasChildren && !page.PageHidden) {
          after = page;
          break;
        } else if (!page.HasChildren && !page.PageHidden) {
          before = page;
        }
      }
      setPrev(before);
      setNext(after);
    }
  }, [outlineData, pageData]);

  return (
    <div className="PageNavigation d-flex justify-content-end" style={{flex: 0}}>
      {prev && (
        <div className={'d-flex align-items-center justify-content-start text-nowrap'}>
          <Link to={prev.PageRoute}>
            <>&nbsp;&laquo;&nbsp;</>
            {prev.NavTitle ? prev.NavTitle : prev.PageTitle}
          </Link>
        </div>
      )}
      <div style={{flex: 1}}></div>
      {next && (
        <div className={'d-flex align-items-center justify-content-end text-nowrap'} style={{flex: 0}}>
          <Link to={next.PageRoute}>
            {next.NavTitle ? next.NavTitle : next.PageTitle}
            <>&nbsp;&raquo;&nbsp;</>
          </Link>
        </div>
      )}
    </div>
  )
}