import {useSiteContext} from "../content/Site";
import {useLocation, useNavigate} from "react-router";
import {onMouseMove, onDragOver, onDragStart, onDragLeave, getCursorPercent} from "./DragUtils";
import {useRestApi} from "../../api/RestApi";

export default function SiteOutline(props) {
  const {Outline, outlineData} = useSiteContext();
  const navigate = useNavigate();
  const location = useLocation();
  const {Pages} = useRestApi();

  function onDrop(e, dropData) {
    e.target.style.borderWidth = 0;
    const percent = getCursorPercent(e, "vertical");
    const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
    if (dragData.PageID === dropData.PageID) {
      // dropped on same item
      return;
    }
    if (percent < 0.40) {
      console.debug(`Move page '${dragData.PageTitle}' before page '${dropData.PageTitle}'`);
      // move outline first for UI responsiveness
      Outline.movePageBefore(dragData, dropData);
      Pages.movePageBefore(dragData.PageID, dropData.PageID)
        .then(() => {
          console.debug(`Page moved.`);
        })
        .catch((err) => {
          console.error(`Error moving page.`, err);
        });
    } else if (percent < 0.60) {
      console.debug(`Make page '${dragData.PageTitle}' child of page '${dropData.PageTitle}'`);
      // move outline first for UI responsiveness
      Outline.makeChildOf(dragData, dropData);
      Pages.makePageChildOf(dragData.PageID, dropData.PageID)
        .then(() => {
          console.debug(`Page moved.`);
        })
        .catch((err) => {
          console.error(`Error moving page.`, err);
        });
    } else {
      console.debug(`Move page '${dragData.PageTitle}' after page '${dropData.PageTitle}'`);
      // move outline first for UI responsiveness
      Outline.movePageAfter(dragData, dropData);
      Pages.movePageAfter(dragData.PageID, dropData.PageID)
        .then(() => {
          console.debug(`Page moved.`);
        })
        .catch((err) => {
          console.error(`Error moving page.`, err);
        });
    }
    e.stopPropagation();
    e.preventDefault();
  }

  return (
    <div {...props}>
      <h5>Site Outline</h5>
      {outlineData?.map((page) => (
        <div
          key={page.PageID}
          style={{
            marginLeft: `${page.OutlineLevel * 20}px`,
            padding: '5px',
            opacity: page.PageHidden ? 0.5 : 1.0,
            background: location.pathname === page.PageRoute ? '#00000020' : 'transparent',
          }}
          onClick={() => {
            navigate(page.PageRoute)
          }}
          onMouseMove={(e) => onMouseMove(e)}
          onDragOver={(e) => onDragOver(e, page, 'vertical')}
          onDragStart={(e) => onDragStart(e, page)}
          onDragLeave={(e) => onDragLeave(e)}
          onDrop={(e) => onDrop(e, page)}
          draggable={true}
        >
          {page.NavTitle ? page.NavTitle : page.PageTitle}
        </div>
      ))}
    </div>
  );
}