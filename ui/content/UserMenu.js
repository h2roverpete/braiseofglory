import {BsPersonCircle} from "react-icons/bs";
import React, {useEffect, useState} from "react";
import {useAuth} from "../../auth/AuthProvider";
import {useNavigate} from "react-router";
import {Nav} from "react-bootstrap";
import {Resource, Permission} from "../../auth/Permissions";
import {useRestApi} from "../../api/RestApi";

export default function UserMenu({buttonRef}) {

  const {isAuthenticated, currentUser} = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState(/** @type {[SMSCampaignData]} */ null);
  const [hasSmsPermission, setHasSmsPermission] = useState(false);
  const {SMS} = useRestApi();
  const {hasPermission} = useAuth();

  useEffect(() => {
    if (hasSmsPermission && !campaigns) {
      SMS.getSmsCampaigns().then((response) => {
        setCampaigns(response);
      }).catch((err) => {
        console.error(err);
      })
    }
  }, [campaigns, setCampaigns, hasPermission, hasSmsPermission, SMS]);

  useEffect(() => {
    const result = hasPermission(Resource.SMS, Permission.SEND);
    setHasSmsPermission(result);
  }, [hasPermission, setHasSmsPermission])

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
        <BsPersonCircle size="20"/>
      </Nav.Link>
      <div className="dropdown-menu dropdown-menu-end" style={{cursor: 'pointer', zIndex: 100}}>
        {isAuthenticated && (
          <span className="dropdown-item" onClick={() => navigate('/admin/user')}>User Profile</span>
        )}
        {hasSmsPermission && campaigns && <>
          {campaigns.map((campaign) =>
            <div key={campaign.SMSCampaignID}>{campaign.SiteID === parseInt(process.env.REACT_APP_SITE_ID) &&
              <span className="dropdown-item" onClick={() => navigate(`/admin/sms?campaignId=${campaign.SMSCampaignID}`)
              }>{campaign.CampaignName}</span>}
            </div>
          )}
        </>}
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