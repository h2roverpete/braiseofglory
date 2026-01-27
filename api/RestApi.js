import React, {useRef} from 'react';
import {useCookies} from "react-cookie";
import {useContext} from "react";
import axios from "axios";

export const RestApiContext = React.createContext({});

export default function RestApi(props) {

  const siteId = parseInt(process.env.REACT_APP_SITE_ID);
  const host = process.env.REACT_APP_BACKEND_HOST;
  const apiKey = process.env.REACT_APP_API_KEY;
  const [cookies] = useCookies(); // can't use auth context, access directly

  axios.defaults.headers.common["x-api-key"] = apiKey;
  if (cookies.token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${cookies.token.access_token}`;
  }

  async function insertOrUpdateSite(data) {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/content/sites`, data);
        return response.data;
      }
    });
  }

  async function getPage(pageId) {
    const response = await axios.get(`${host}/api/v1/content/pages/${pageId}`);
    return response.data;
  }

  async function getPageSections(pageId) {
    const response = await axios.get(`${host}/api/v1/content/pages/${pageId}/sections`);
    return response.data;
  }

  async function insertOrUpdatePageSection(data) {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/content/pages/${data.PageID}/sections`, data);
        return response.data;
      }
    });
  }

  async function uploadSectionImage(pageId, pageSectionId, file) {
    return await adminApiCall(() => {
      return async () => {
        const formData = new FormData();
        formData.append('SectionImage', file);
        const response = await axios.post(`${host}/api/v1/content/pages/${pageId}/sections/${pageSectionId}/image`, formData);
        return response.data;
      }
    });
  }

  async function deleteSectionImage(pageId, pageSectionId) {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/content/pages/${pageId}/sections/${pageSectionId}/image`);
        return response.data;
      }
    });
  }

  async function deletePageSection(pageId, pageSectionId) {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/content/pages/${pageId}/sections/${pageSectionId}`);
        return response.data;
      }
    });
  }

  async function insertOrUpdatePage(data) {
    return await adminApiCall(() => {
      return async () => {
        console.debug("Insert or update Page...");
        const response = await axios.post(`${host}/api/v1/content/pages`, data);
        return response.data;
      }
    });
  }

  async function deletePage(pageId) {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/content/pages/${pageId}`);
        return response.data;
      }
    });
  }

  async function movePageBefore(pageId, beforePageId) {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/content/pages/${pageId}/before/${beforePageId}`);
        return response.data;
      }
    });
  }

  async function movePageAfter(pageId, afterPageId) {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/content/pages/${pageId}/after/${afterPageId}`);
        return response.data;
      }
    });
  }

  async function makePageChildOf(pageId, parentId) {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/content/pages/${pageId}/childof/${parentId}`);
        return response.data;
      }
    });
  }

  async function getSite() {
    const response = await axios.get(`${host}/api/v1/content/sites/${siteId}`);
    return response.data;
  }

  async function getSiteOutline() {
    const response = await axios.get(`${host}/api/v1/content/sites/${siteId}/outline`);
    return response.data;
  }

  async function getSitemap() {
    const response = await axios.get(`${host}/api/v1/content/sites/${siteId}/sitemap`);
    return response.data;
  }

  async function getGuestBooks() {
    const response = await axios.get(`${host}/api/v1/guestbooks`);
    return response.data;
  }

  async function getGuestBook(guestBookId) {
    const response = await axios.get(`${host}/api/v1/guestbook/${guestBookId}`);
    return response.data;
  }

  async function insertOrUpdateGuestBook(data) {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/guestbook`, data);
        return response.data;
      }
    });
  }

  async function deleteGuestBook(guestBookId) {
    const response = await axios.delete(`${host}/api/v1/guestbook/${guestBookId}`);
    return response.data;
  }

  async function getGuest(guestId) {
    const response = await axios.get(`${host}/api/v1/guestbook/guest/${guestId}`);
    return response.data;
  }

  async function insertOrUpdateGuest(guestBookId, data) {
    const response = await axios.post(`${host}/api/v1/guestbook/${guestBookId}/guest`, data);
    return response.data;
  }

  async function getGuestFeedback(guestFeedbackId) {
    const response = await axios.get(`${host}/api/v1/guestbook/feedback/${guestFeedbackId}`);
    return response.data;
  }

  async function insertOrUpdateGuestFeedback(guestId, data) {
    const response = await axios.post(`${host}/api/v1/guestbook/guest/${guestId}/feedback`, data);
    return response.data;
  }

  async function getGallery(galleryId) {
    const response = await axios.get(`${host}/api/v1/gallery/${galleryId}`);
    return response.data;
  }

  async function getGalleries() {
    const response = await axios.get(`${host}/api/v1/galleries`);
    return response.data;
  }

  async function insertOrUpdateGallery(data) {
    return adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/galleries`, data);
        return response.data;
      }
    });
  }

  async function deleteGallery(galleryId) {
    return adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/galleries/${galleryId}`);
        return response.data;
      }
    });
  }

  async function getPhotos(galleryId) {
    const response = await axios.get(`${host}/api/v1/gallery/${galleryId}/photos`);
    return response.data;
  }

  async function getPageExtras(pageId) {
    const response = await axios.get(`${host}/api/v1/content/pages/${pageId}/extras`);
    return response.data;
  }

  async function insertOrUpdateExtra(data) {
    return await adminApiCall(() => {
      return async () => {
        const formData = new FormData();
        for (const fieldName in data) {
          if (data[fieldName] !== undefined && data[fieldName] !== null) {
            formData.append(fieldName, data[fieldName]);
          }
        }
        const response = await axios.post(`${host}/api/v1/content/extras`, formData);
        return response.data;
      }
    });
  }

  async function deleteExtra(extraId) {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/content/extras/${extraId}`);
        return response.data;
      }
    });
  }

  async function getAuthToken(clientId, redirectUrl, authCode) {
    const response = await axios.post(`${host}/oauth/token?client_id=${clientId}&redirect_uri=${redirectUrl}&code=${authCode}&grant_type=authorization_code`);
    return response.data;
  }

  async function refreshToken(refreshToken, clientId) {
    const response = await axios.post(`${host}/oauth/token?client_id=${clientId}&grant_type=refresh_token&refresh_token=${refreshToken}`);
    return response.data;
  }

  async function checkToken() {
    const response = await axios.get(`${host}/oauth/check`);
    return response.data;
  }

  /**
   * @callback RestApiCall
   * @return {Promise<any>}
   */

  /**
   * @callback RestApiCallFactory
   * @return {RestApiCall}
   */

  /**
   * Execute a "protected" admin REST API call.
   *
   * Protected calls modify site content and require a valid OAuth token and permissions
   * in addition to an API key.
   *
   * If the original call throws an Auth error, attempts to refresh the auth token
   * and executes the call again.
   *
   * @param callFactory {RestApiCallFactory} Factory function returns a Promise which runs the API call and returns a result.
   * @returns {any} Response from Rest API call
   */
  async function adminApiCall(callFactory) {
    try {
      return await (callFactory())();
    } catch (error) {
      if (error.status === 401) {
        // auth error occurred
        if (refreshAuthTokenRef.current) {
          try {
            console.warn(`Auth token invalid. Refreshing...`);
            const newToken = await refreshAuthTokenRef.current.refreshAuthToken();
            axios.defaults.headers.common["Authorization"] = `Bearer ${newToken.access_token}`;
          } catch (err2) {
            console.error(`Error refreshing auth token.`, err2);
            // throw original error
            throw error;
          }
          // don't surround retry with try/catch, caller can catch the error
          console.debug(`Retrying REST API call.`);
          return await (callFactory())();
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  // receives refresh function from Auth module
  const refreshAuthTokenRef = useRef(null);

  return (
    <RestApiContext value={{
      Sites: {
        insertOrUpdateSite: insertOrUpdateSite,
        getSite: getSite,
        getSiteOutline: getSiteOutline,
        getSitemap: getSitemap,
      },
      Pages: {
        getPage: getPage,
        deletePage: deletePage,
        movePageAfter: movePageAfter,
        movePageBefore: movePageBefore,
        makePageChildOf: makePageChildOf,
        insertOrUpdatePage: insertOrUpdatePage,
        getPageSections: getPageSections,
      },
      PageSections: {
        insertOrUpdatePageSection: insertOrUpdatePageSection,
        uploadSectionImage: uploadSectionImage,
        deleteSectionImage: deleteSectionImage,
        deletePageSection: deletePageSection,
        insertOrUpdatePage: insertOrUpdatePage,
      },
      GuestBooks: {
        getGuestBook: getGuestBook,
        getGuestBooks: getGuestBooks,
        insertOrUpdateGuestBook: insertOrUpdateGuestBook,
        deleteGuestBook: deleteGuestBook,
        getGuest: getGuest,
        insertOrUpdateGuest: insertOrUpdateGuest,
        getGuestFeedback: getGuestFeedback,
        insertOrUpdateGuestFeedback: insertOrUpdateGuestFeedback,
      },
      Galleries: {
        getGallery: getGallery,
        getGalleries: getGalleries,
        getPhotos: getPhotos,
        insertOrUpdateGallery: insertOrUpdateGallery,
        deleteGallery: deleteGallery,
      },
      Extras: {
        getPageExtras: getPageExtras,
        insertOrUpdateExtra: insertOrUpdateExtra,
        deleteExtra: deleteExtra,
      },
      Auth: {
        getAuthToken: getAuthToken,
        refreshToken: refreshToken,
        checkToken: checkToken,
        refreshAuthTokenRef: refreshAuthTokenRef,
      },
    }}>
      {props.children}
    </RestApiContext>
  );
}

export function useRestApi() {
  return useContext(RestApiContext);
}