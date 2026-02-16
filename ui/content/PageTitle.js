import {PageContext} from "./Page";
import {useContext, useRef} from "react";
import {useRestApi} from "../../api/RestApi";
import EditableField from "../editor/EditableField";
import {useEdit} from "../editor/EditProvider";
import {useSiteContext} from "./Site";

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
export default function PageTitle({alwaysShow}) {

  const {error, login, pageData} = useContext(PageContext);
  const {Outline} = useSiteContext();
  const {Pages} = useRestApi();
  const {canEdit} = useEdit();

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
      {error?.title ? error.title : login ? `Log In` : pageData?.PageTitle.length > 0 ? pageData.PageTitle : (<>&nbsp;</>)}
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
      />
    ) : (
      <>{(pageData?.PageTitle.length || error?.title.length || alwaysShow || login) && (
        <>{title}</>
      )}</>
    )}</>
  )
}