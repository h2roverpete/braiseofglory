import AuthProvider from "./auth/AuthProvider";
import RestApiProvider from "./api/RestApi";
import {BrowserRouter} from "react-router";
import {CookiesProvider} from "react-cookie";
import React from "react";

/**
 * Provide all dependencies for a framework app.
 * Should be the outermost component of the app.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default function FrameworkApp(props) {
  // replace console functions to disable non-error logging on production
  if (process.env.NODE_ENV === 'production') {
    console.warn = () => {
    }
    console.info = () => {
    }
    console.log = () => {
    }
    console.debug = () => {
    }
  }
  return (
    <CookiesProvider>
      <RestApiProvider>
        <AuthProvider>
          <BrowserRouter>
            {props.children}
          </BrowserRouter>
        </AuthProvider>
      </RestApiProvider>
    </CookiesProvider>
  );
}