import {useContext, createContext, useState, useEffect, useImperativeHandle, useCallback} from "react";
import {useCookies} from 'react-cookie';
import {useRestApi} from "../api/RestApi";
import {jwtDecode} from 'jwt-decode';
import {Resource, ResourcePermissions} from "./Permissions";

export const AuthContext = createContext({});

export default function AuthProvider(props) {
  const [cookies, setCookie] = useCookies();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {Auth} = useRestApi();

  useEffect(() => {
    setIsAuthenticated(cookies.token && user);
  }, [cookies.token, user, setIsAuthenticated]);

  useImperativeHandle(Auth.refreshAuthTokenRef, () => {
    return {
      refreshAuthToken: refreshAuthToken,
    }
  });

  /**
   * Check if a permission is present.
   * Fails until token is verified.
   *
   * @param resource {string}
   * @param permission {string}
   * @returns {Promise<boolean>}
   */
  const hasPermission = useCallback((resource, permission) => {
    console.debug(`Check permission '${resource}:${permission}' for current user.`);
    if (user) {
      if (user.SiteID !== '0' && user.SiteID !== process.env.REACT_APP_SITE_ID) {
        console.error(`User not authorized for this site.`);
        return false;
      }
      const permissionList = ResourcePermissions[resource];
      if (permissionList) {
        const requestedIndex = permissionList.findIndex((item) => item.permission === permission);
        let userIndex = -1;
        switch (resource) {
          case Resource.SITE:
            userIndex = permissionList.findIndex((item) => item.permission === user.SitePermission);
            break;
          case Resource.PAGE:
            userIndex = permissionList.findIndex((item) => item.permission === user.PagePermission);
            break;
          case Resource.GALLERY:
            userIndex = permissionList.findIndex((item) => item.permission === user.GalleryPermission);
            break;
          case Resource.GUESTBOOK:
            userIndex = permissionList.findIndex((item) => item.permission === user.GuestBookPermission);
            break;
          case Resource.USERS:
            userIndex = permissionList.findIndex((item) => item.permission === user.UserPermission);
            break;
          default:
            break;
        }
        const canEdit = userIndex >= 0 && requestedIndex >= 0 && userIndex <= requestedIndex;
        console.debug(`Permission for ${resource}:${permission} = ${canEdit}.`);
        return canEdit;
      } else {
        // unknown resource
        console.error(`Unknown resource.`);
        return false;
      }
    } else {
      // user not logged in
      return false;
    }
  }, [user]);

  const setToken = useCallback((newToken) => {
    console.debug(`Set token: ${JSON.stringify(newToken)}`);
    // update token value
    setCookie('token', newToken);
    if (newToken) {
      // decode token and set user
      const decoded = jwtDecode(newToken);
      setUser(decoded);
    } else {
      // clear user
      setUser(null);
    }
  }, [setCookie, setUser]);

  const refreshAuthToken = useCallback(async () => {
    if (cookies.token?.refresh_token) {
      console.debug(`Refreshing auth token...`);
      const newToken = await Auth.refreshToken(cookies.token.refresh_token, window.location.host);
      setToken(newToken);
      return newToken;
    } else {
      return null;
    }
  }, [Auth, setToken, cookies.token?.refresh_token]);

  const validateToken = useCallback(async () => {
    try {
      console.debug(`Validating token...`);
      const decoded = await Auth.checkToken();
      console.debug(`Token data: ${JSON.stringify(decoded)}`);
      setUser(decoded);
    } catch (error) {
      if (error.status === 401) {
        try {
          // token refused, try refreshing
          await refreshAuthToken()
        } catch (error) {
          console.error(`Error refreshing token: ${JSON.stringify(error)}`);
        }
      } else {
        console.error(`Unknown error checking token: ${JSON.stringify(error)}`);
      }
    }
  }, [Auth, setUser, refreshAuthToken]);

  useEffect(() => {
    if (cookies.token) {
      validateToken().then();
    }
  }, [cookies.token, validateToken]);


  return (
    <AuthContext
      value={{
        token: cookies.token,
        setToken: setToken,
        hasPermission: hasPermission,
        isAuthenticated: isAuthenticated,
        refreshAuthToken: refreshAuthToken,
      }}>
      {props.children}
    </AuthContext>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};