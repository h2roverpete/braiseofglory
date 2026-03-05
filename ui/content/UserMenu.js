import {BsPersonCircle} from "react-icons/bs";
import React from "react";
import {useAuth} from "../../auth/AuthProvider";
import {useNavigate} from "react-router";

export default function UserMenu({buttonRef}) {

  const {isAuthenticated, currentUser} = useAuth();
  const navigate = useNavigate();

  return (<>
    <div
      className="UserMenu button-group navbar-nav"
      ref={buttonRef}
    >
      <a
        className={`NavLink UserMenuButton nav-dropdown nav-link d-flex align-items-center`}
        style={{cursor: 'pointer'}}
        data-bs-toggle="dropdown"
      >
        <div className={`pe-2`}>{currentUser?.UserName}</div>
        <BsPersonCircle size="20" />
      </a>
      <div className="dropdown-menu dropdown-menu-end" style={{cursor: 'pointer', zIndex: 100}}>
        {isAuthenticated && (
          <span className="dropdown-item" onClick={() => navigate('/admin/user')}>User Profile</span>
        )}
        {!isAuthenticated && (
          <span className="dropdown-item" onClick={() => navigate('/login')}>Log In</span>
        )}
        {isAuthenticated && (
          <span className="dropdown-item" onClick={() => navigate('/logout')}>Log Out</span>
        )}
      </div>
    </div>
  </>);
}