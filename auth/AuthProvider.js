import {useContext, createContext, useState, useEffect, useImperativeHandle, useCallback} from "react";
import {useCookies} from 'react-cookie';
import {useRestApi} from "../api/RestApi";
import EditProvider from "../ui/editor/EditProvider";

export const AuthContext = createContext({});

/**
 * Site permissions.
 *
 * @enum {string}
 */
export const Permission = {
  ADMIN: "admin",
  EDIT: "edit",
  VIEW: "view",
  NONE: "none"
}

export default function AuthProvider(props) {
  const [cookies, setCookie] = useCookies();
  const [scope, setScope] = useState(null);
  const [username, setUsername] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {Auth} = useRestApi();

  useEffect(() => {
    setIsAuthenticated(cookies.token && username && scope);
  }, [cookies.token, username, scope]);

  useImperativeHandle(Auth.refreshAuthTokenRef, () => {
    return {
      refreshAuthToken: refreshAuthToken,
    }
  });

  /**
   * Check if a permission is present.
   * Fails until token is verified.
   *
   * @param permission
   * @returns {Promise<boolean>}
   */
  const hasPermission = useCallback(async (permission) => {
    console.debug(`Check permission '${permission}' for current user.`);
    if (scope) {
      return checkScopes(scope, `${document.location.host}:${permission}`);
    } else {
      return false;
    }
  }, [scope]);

  const setToken = useCallback((newToken) => {
    console.debug(`Set token: ${JSON.stringify(newToken)}`);
    // update token value
    setCookie('token', newToken);
    // clear username and scope
    setUsername(null);
    setScope(null);
  }, [setCookie, setUsername, setScope]);

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
      setUsername(decoded.user);
      setScope(decoded.scope);
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
  }, [Auth, setUsername, setScope, refreshAuthToken]);

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
      <EditProvider>
        {props.children}
      </EditProvider>
    </AuthContext>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * Check a requested scope against a list of allowed scopes.
 *
 * @param {string} allowedScopes      Comma delimited list of allowed scopes (or one scope).
 * @param {string} requestedScopes    Comma delimited list of requested scopes (or one scope).
 */
function checkScopes(allowedScopes, requestedScopes) {
  const allowed = allowedScopes.split(",");
  if (allowed.includes('*')) {
    // all allowed
    return true;
  }
  const requested = requestedScopes.split(",");
  for (const requestedScope of requested) {
    if (!allowedScopes.includes(requestedScope)) {
      // not matched
      return false;
    }
  }
  // all matched
  return true;
}