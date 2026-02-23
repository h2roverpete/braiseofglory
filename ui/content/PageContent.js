import {useEffect, useState} from "react";
import {Permission, Resource} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";
import {Button} from "react-bootstrap";
import PageTitle from "./PageTitle";
import {usePageContext} from "./Page";

/**
 * Element to show page content
 *
 * A <div> element with class names "content container"
 *
 * @param children{[JSX.Element]}   Elements to add at the end of page content.
 * @constructor
 */
export default function PageContent({children}) {

  const {hasPermission, isAuthenticated} = useAuth();
  const {pageData} = usePageContext();

  const [canView, setCanView] = useState(true);
  useEffect(() => {
    setCanView(!pageData?.RequiresLogin || hasPermission(Resource.PAGE, Permission.BROWSE_PROTECTED));
  }, [pageData, hasPermission, setCanView]);

  return (<>
    {canView ? (
      <div className="PageContent container-fluid" data-testid="PageContent">
        {children}
      </div>
    ) : (
      <div className="PageContent container-fluid" data-testid="PageContent">
        <PageTitle text={"Protected Content"}/>
        <div className="PageSection">
          <p>You don't have permission to access this page.</p>
          {!isAuthenticated && (<Button href={'/login'}>Log In</Button>)}
        </div>
      </div>
    )}
  </>);
}