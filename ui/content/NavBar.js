import {useRef} from "react";
import {useSiteContext} from "./Site";
import {usePageContext} from "./Page";
import Navbar from 'react-bootstrap/Navbar';
import {Nav, NavDropdown} from "react-bootstrap";
import {useNavigate} from "react-router";
import {useAuth} from "../../auth/AuthProvider";
import {useEdit} from "../editor/EditProvider";
import {useRestApi} from "../../api/RestApi";
import React from 'react';
import {useTouchContext} from "../../util/TouchProvider";
import AddPageMenu from "../editor/AddPageMenu";


/**
 * @typedef NavBarProps
 *
 * @property {String} [brand]           Explicit brand name.
 * @property {String} [brandClassName]  CSS class to apply to brand/logo component
 * @property {string} [icon]            Logo icon for branding. When provided, default brand text is blank.
 * @property {string} [expand]          Bootstrap width boundary to expand/collapse the nav bar, use empty string to prevent collapsing.
 * @property {string} [fixed]           Fix the navbar to a viewport location, i.e. 'top', 'bottom'
 * @property {boolean} [showLogin]      Show a top level element for logging in?
 */

/**
 * Boostrap navbar for site navigation.
 *
 * @param props{NavBarProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function NavBar(props) {

  const {siteData, getChildren, Outline} = useSiteContext();
  const {pageData, breadcrumbs} = usePageContext();
  const navigate = useNavigate();
  const togglerRef = useRef(null);
  const {token} = useAuth();
  const {canEdit} = useEdit();
  const {Pages} = useRestApi();
  const editButtonRef = useRef(null);
  const {supportsHover} = useTouchContext();

  function navigateTo(to) {
    if ((togglerRef.current.style.visible || togglerRef.current.style.display !== 'none') && !togglerRef.current.classList.contains("collapsed")) {
      // toggle is active, collapse menu on navigation
      togglerRef.current.click();
    }
    // react-router navigation
    navigate(to);
  }

  function isInCurrentPath(pageId) {
    if (!pageData || !breadcrumbs) {
      return false
    } else if (pageId === pageData.PageID) {
      return true;
    } else {
      for (const page of breadcrumbs) {
        if (page.PageID === pageId) {
          return true;
        }
      }
      return false;
    }
  }

  function RecursiveDropdown(props) {
    const children = getChildren(props.pageData.PageID);
    return (
      <>{children.length === 0 ? (
        // no children to render
        <NavDropdown.Item
          draggable={canEdit}
          onMouseMove={(e) => mouseMoveHandler(e)}
          onDragStart={(e) => dragStartHandler(e, props.pageData)}
          onDragOver={(e) => dragOverHandler(e, props.pageData, 'vertical')}
          onDragLeave={(e) => dragLeaveHandler(e)}
          onDrop={(e) => dropHandler(e, props.pageData, 'vertical')}
          key={props.pageData.PageID}
          onClick={() => navigateTo(props.pageData.PageRoute)}
          className={`NavbarDropdownItem text-nowrap${isInCurrentPath(props.pageData.PageID) ? ' active' : ''}`}
          data-testid={`NavItem-${props.pageData.PageID}`}
        >
          {props.pageData.NavTitle ? props.pageData.NavTitle : props.pageData.PageTitle}
        </NavDropdown.Item>
      ) : (
        // at least one child, render a dropdown
        <NavDropdown
          className="NavbarDropdown"
          draggable={canEdit}
          onMouseMove={(e) => mouseMoveHandler(e)}
          onDragStart={(e) => dragStartHandler(e, props.pageData)}
          onDragOver={(e) => dragOverHandler(e, props.pageData, 'horizontal')}
          onDragLeave={(e) => dragLeaveHandler(e)}
          onDrop={(e) => dropHandler(e, props.pageData, 'horizontal')}
          key={props.pageData.PageID}
          title={props.pageData.NavTitle ? props.pageData.NavTitle : props.pageData.PageTitle}
          id={`nav-dropdown${isInCurrentPath(props.pageData.PageID) ? '-active' : ''}`}
          data-testid={`NavItem-${props.pageData.PageID}`}
        >
          <>{children.map((item) => (
            <React.Fragment key={item.PageID}>{getChildren(item.PageID).length > 0 ? (
              // render further dropdown levels
              <RecursiveDropdown pageData={item}/>
            ) : (
              // render this dropdown level
              <NavDropdown.Item
                draggable={canEdit}
                onMouseMove={(e) => mouseMoveHandler(e)}
                onDragStart={(e) => dragStartHandler(e, item)}
                onDragOver={(e) => dragOverHandler(e, item, 'vertical')}
                onDragLeave={(e) => dragLeaveHandler(e)}
                onDrop={(e) => dropHandler(e, item, 'vertical')}
                className={`NavbarDropdownItem text-nowrap${pageData?.PageID === item.PageID ? ' active' : ''}`}
                key={item.PageID}
                onClick={() => navigateTo(item.PageRoute)}
                data-testid={`NavItem-${item.PageID}`}
              >
                {item.NavTitle ? item.NavTitle : item.PageTitle}
              </NavDropdown.Item>
            )}</React.Fragment>
          ))}</>
        </NavDropdown>
      )}</>
    );
  }

  function mouseMoveHandler(e) {
    if (canEdit) {
      const percent = getCursorPercent(e, 'horizontal')
      e.target.style.cursor = percent < 0.25 ? 'move' : 'pointer';
    }
  }

  function dragStartHandler(e, data) {
    if (canEdit) {
      if (!e.dataTransfer.getData('application/json')) {
        e.target.style.cursor = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify(data));
        e.stopPropagation()
      }
    }
  }

  function getCursorPercent(e, direction) {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const width = e.nativeEvent.target.offsetWidth;
    const height = e.nativeEvent.target.offsetHeight;
    return direction === 'vertical' ? y / height : x / width;
  }

  function dragOverHandler(e, dropData, direction) {
    if (togglerRef.current?.checkVisibility()) {
      // navbar is collapsed, all items are vertical
      direction = 'vertical';
    }
    const percent = getCursorPercent(e, direction);
    if (canEdit) {
      if (direction === 'vertical') {
        e.target.style.borderStyle = 'solid';
        if (percent < 0.40) {
          e.target.style.borderWidth = '2px 0 0 0';
        } else if (percent < 0.60) {
          e.target.style.borderWidth = '0 2px 0 0';
        } else {
          e.target.style.borderWidth = '0 0 2px 0';

        }
      } else if (direction === 'horizontal') {
        e.target.style.borderStyle = 'solid';
        if (percent < 0.40) {
          e.target.style.borderWidth = '0 0 0 2px';
        } else if (percent < 0.60) {
          e.target.style.borderWidth = '0 0 2px 0';
        } else {
          e.target.style.borderWidth = '0 2px 0 0';
        }
      }
      e.preventDefault();
    }
  }

  function dragLeaveHandler(e) {
    e.target.style.borderWidth = '0 0 0 0';
  }

  /**
   * Process a drop event to reorder navigation.
   *
   * @param e                   Drag Event
   * @param dropData {PageData} Data about the page being dropped on.
   * @param direction {String}  Direction of elements: 'vertical' or 'horizontal'
   */
  function dropHandler(e, dropData, direction) {
    if (canEdit) {
      if (togglerRef.current?.checkVisibility()) {
        // navbar is collapsed, all items are vertical
        direction = 'vertical';
      }
      e.target.style.borderStyle = 'none';
      e.target.style.borderWidth = '0 0 0 0';
      const percent = getCursorPercent(e, direction);
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
  }

  return (
    <Navbar
      expand={props.expand ? props.expand : 'sm'}
      className={`NavBar ${!props.expand ? 'navbar-expand' : ''}`}
      data-bs-theme={props.theme ? props.theme : "light"}
      fixed={props.fixed ? props.fixed : undefined}
      data-testid="NavBar"
      onMouseOver={() => {
        if (canEdit && supportsHover) editButtonRef.current.hidden = false
      }}
      onMouseLeave={() => {
        if (canEdit && supportsHover) editButtonRef.current.hidden = true
      }}
    >
      <div
        className="NavBarContents
        container-fluid"
        data-testid="NavBarContents"
      >
        <>{(props.brand || props.icon) && (
          <Navbar.Brand
            style={{cursor: 'pointer'}}
            className={`NavBarBrand ${props.brandClassName}`}
            data-testid="NavBarBrand"
          >
            <>{props.icon && (
              <img
                className="NavBarBrandIcon"
                src={props.icon}
                alt={props.brand?.length ? props.brand : siteData?.SiteName}
                height={45}
                style={{marginRight: '10px'}}
                onClick={() => {
                  navigateTo('/')
                }}
                data-testid="NavBarBrandIcon"
              />
            )}</>
            <>{props.brand?.length > 0 && (
              <span
                className={'NavBarBrandText text-nowrap'}
                onClick={() => {
                  navigateTo('/')
                }}
                data-testid="NavBarBrandText"
              >
                {props.brand}
              </span>
            )}</>
          </Navbar.Brand>
        )}</>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          id="NavbarToggle"
          className="NavbarToggle"
          ref={togglerRef}
        />
        <Navbar.Collapse
          className="NavbarCollapse"
          id="MainNavigation"
          style={{position: 'relative'}}
        >
          <Nav>
            {getChildren(0).map((item) => (
              <React.Fragment
                key={item.PageID}
              >
                {getChildren(item.PageID).length > 0 ? (
                  <RecursiveDropdown pageData={item}/>
                ) : (
                  <Nav.Link
                    draggable={canEdit}
                    style={{cursor: canEdit ? 'move' : 'pointer'}}
                    onMouseMove={(e) => mouseMoveHandler(e)}
                    onDragStart={(e) => dragStartHandler(e, item)}
                    onDragOver={(e) => dragOverHandler(e, item, 'horizontal')}
                    onDragLeave={(e) => dragLeaveHandler(e)}
                    onDrop={(e) => dropHandler(e, item, 'horizontal')}
                    onClick={() => navigateTo(item.PageRoute)}
                    className={`NavLink text-nowrap${isInCurrentPath(item.PageID) ? ' active' : ''}`}
                    key={item.PageID}
                    data-testid={`NavItem-${item.PageID}`}
                  >
                    {item.NavTitle ? item.NavTitle : item.PageTitle}
                  </Nav.Link>
                )}
              </React.Fragment>
            ))}
            <>{props.showLogin === true && (
              <>{token ? (
                <Nav.Link
                  onClick={() => navigateTo('/logout')}
                  className={`NavItem text-nowrap`}
                  key={`Logout`}
                  data-testid={`NavItem-Logout`}
                >
                  Log Out
                </Nav.Link>
              ) : (
                <Nav.Link
                  onClick={() => navigateTo('/login')}
                  className={`NavItem text-nowrap`}
                  key={`Login`}
                  data-testid={`NavItem-Login`}
                >
                  Log In
                </Nav.Link>
              )}</>
            )}</>
          </Nav>
          {canEdit && (
            <AddPageMenu editButtonRef={editButtonRef}/>
          )}
        </Navbar.Collapse>
      </div>
    </Navbar>
  )
}
