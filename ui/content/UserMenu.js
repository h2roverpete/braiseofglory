import {BsPersonCircle} from "react-icons/bs";
import React from "react";
import {useAuth} from "../../auth/AuthProvider";
import {useNavigate} from "react-router";
import {Nav} from "react-bootstrap";

export default function UserMenu({buttonRef}) {

  const {isAuthenticated, currentUser} = useAuth();
  const navigate = useNavigate();

  return (<>
    <div
      className="UserMenu button-group navbar-nav"
      ref={buttonRef}
    >
      <Nav.Link
        className={`NavLink d-flex align-items-center`}
        data-bs-toggle="dropdown"
      >
        <div className={`pe-2`}>{currentUser?.UserName}</div>
        <BsPersonCircle size="20" />
      </Nav.Link>
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