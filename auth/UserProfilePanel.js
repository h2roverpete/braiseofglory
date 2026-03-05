import {useAuth} from "./AuthProvider";
import RestrictedContent from "./RestrictedContent";
import PageTitle from "../ui/content/PageTitle";
import FormEditor from "../ui/editor/FormEditor";
import UserFields from "./UserFields";
import EditorButtons from "../ui/editor/EditorButtons";
import {useRestApi} from "../api/RestApi";
import {useSiteContext} from "../ui/content/Site";
import {isValidEmail, isValidPassword} from "../util/Validators"
import {Container} from "react-bootstrap";

/**
 * Display message that the user doesn't have permission to view the content.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function UserProfilePanel() {

  const {isAuthenticated} = useAuth();
  const {Users} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  function handleUpdate(data) {
    Users.insertOrUpdateUser(data).then(() => {
      console.debug("User updated successfully.");
    }).catch(err => showErrorAlert(err));
  }

  function isDataValid(data) {
    return data.UserName?.length > 0
      && isValidEmail(data.UserEmail)
      && (isValidPassword(data.Password) || !data.Password)
  }

  return (<>
    {isAuthenticated ? (
      <Container fluid className="PageContent">
        <PageTitle text={"User Profile"}/>
        <FormEditor>
          <form>
            <UserFields/>
            <EditorButtons onUpdate={handleUpdate} isDataValid={isDataValid}/>
          </form>
        </FormEditor>
      </Container>
    ) : <RestrictedContent/>}
  </>);
}