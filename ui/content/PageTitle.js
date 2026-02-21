import {PageContext} from "./Page";
import {useContext, useEffect, useRef, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import EditableField from "../editor/EditableField";
import {useSiteContext} from "./Site";
import {Permission, Resource} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";

/**
 * Display the page title in an <h1> tag.
 *
 * If the page title has not loaded yet, still displays the
 * tag and reserves its space in the layout.
 *
 * If the site is in a login state, displays "Log In" as the title.
 *
 * Must be located within the <Page> tag to receive context.
 *
 * @param alwaysShow {Boolean} Always show <h1> element, even when text is empty.
 * @returns {JSX.Element}
 * @constructor
 */
export default function PageTitle({text, alwaysShow}) {

  const {error, login, pageData} = useContext(PageContext);
  const {Outline, currentPage} = useSiteContext();
  const {Pages} = useRestApi();
  const {hasPermission} = useAuth();

  const [titleText, setTitleText] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.PAGE, Permission.EDIT));
  }, [setCanEdit, hasPermission]);

  useEffect(() => {
    if (text) {
      setTitleText(text);
    } else if (pageData) {
      setTitleText(pageData.PageTitle);
    } else if (currentPage) {
      setTitleText(currentPage.PageTitle);
    }
  }, [pageData, currentPage, setTitleText, text]);

  function onTitleChanged({textContent, textAlign}) {
    if (pageData) {
      console.debug(`Updating page title: textContent=${textContent}, textAlign=${textAlign}`);
      pageData.PageTitle = textContent;
      pageData.PageTitleAlign = textAlign;
      Pages.insertOrUpdatePage(pageData)
        .then((result) => {
          console.debug(`Page title updated.`);
          // refresh outline with new title
          Outline.updatePage(result);
        })
        .catch((err) => {
          console.error(`Error updating page title: ${err.message}`);
        })
    }
  }

  const titleRef = useRef(null);
  const title = (
    <h1
      className={`PageTitle`}
      style={{
        width: '100%',
        textAlign: pageData?.PageTitleAlign,
      }}
      data-testid="PageTitle"
      ref={titleRef}
    >
      {error?.title ? error.title : login ? `Log In` : titleText ? titleText : (<>&nbsp;</>)}
    </h1>
  )

  return (
    <>{(canEdit && !error) ? (
      <EditableField
        field={title}
        fieldRef={titleRef}
        callback={onTitleChanged}
        textContent={pageData?.PageTitle}
        textAlign={pageData?.PageTitleAlign}
        showEditButton={true}
        alwaysShow={alwaysShow === true}
        canEdit={canEdit}
      />
    ) : (
      <>{(pageData?.PageTitle.length || error?.title.length || alwaysShow || login) && (
        <>{title}</>
      )}</>
    )}</>
  )
}