import {PageContext} from "./Page";
import {useContext, useRef} from "react";
import {useRestApi} from "../../api/RestApi";
import EditableField from "../editor/EditableField";
import {useEdit} from "../editor/EditProvider";
import {useSiteContext} from "./Site";

/**
 * @typedef PageTitleProps
 * @property alwaysShow {Boolean}
 */

/**
 * Display the page title in an <h1> tag.
 *
 * If the page title has not loaded yet, still displays the
 * tag and reserves its space in the layout.
 *
 * If the site is in a login state, displays "Log In" as the title.
 *
 * Must be located within the <Page> tag to receive page context.
 *
 * @param props {PageTitleProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function PageTitle(props) {

  const {error, login} = useContext(PageContext);
  const {Outline, currentPage} = useSiteContext();
  const {Pages} = useRestApi();
  const {canEdit} = useEdit();

  function onTitleChanged({textContent, textAlign}) {
    if (currentPage) {
      console.debug(`Updating page title: textContent=${textContent}, textAlign=${textAlign}`);
      currentPage.PageTitle = textContent;
      currentPage.PageTitleAlign = textAlign;
      Pages.insertOrUpdatePage(currentPage)
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
        textAlign: currentPage?.PageTitleAlign,
      }}
      data-testid="PageTitle"
      ref={titleRef}
    >
      {error?.title ? error.title : login ? `Log In` : currentPage?.PageTitle.length > 0 ? currentPage.PageTitle : (<>&nbsp;</>)}
    </h1>
  )

  return (
    <>{(canEdit && !error) ? (
      <EditableField
        field={title}
        fieldRef={titleRef}
        callback={onTitleChanged}
        textContent={currentPage?.PageTitle}
        textAlign={currentPage?.PageTitleAlign}
        showEditButton={true}
        alwaysShow={props.alwaysShow === true}
      />
    ) : (
      <>{(currentPage?.PageTitle.length || error?.title.length || props.alwaysShow || login) && (
        <>{title}</>
      )}</>
    )}</>
  )
}