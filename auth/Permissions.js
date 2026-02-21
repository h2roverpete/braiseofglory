/**
 * Resource types.
 * @enum {string}
 */
const Resource = {
  SITE: "site",
  PAGE: "page",
  GALLERY: "gallery",
  GUESTBOOK: "guestbook",
  USERS: "users",
}

/**
 * Resource permissions.
 * @enum {string}
 */
const Permission = {
  ADMIN: "admin",
  EDIT: "edit",
  BROWSE_PROTECTED: "browse_protected",
  BROWSE: "browse",
  UPDATE: "update",
  ADD: "add",
  DELETE: "delete",
  NONE: "none",
}

/**
 * Map of resources to their associated permissions.
 * Permissions lists are hierarchical, meaning that if a permission
 * is declared first, it includes all subsequent permissions.
 */
const ResourcePermissions = {
  [Resource.SITE]: [
    {permission: Permission.ADMIN, description: 'Administrator'},
    {permission: Permission.EDIT, description: 'Edit Site Outline'},
    {permission: Permission.BROWSE, description: 'Browse Only'},
  ],
  [Resource.PAGE]: [
    {permission: Permission.ADMIN, description: 'Administrator'},
    {permission: Permission.EDIT, description: 'Edit Page Contents'},
    {permission: Permission.BROWSE_PROTECTED, description: 'Browse Protected Pages'},
    {permission: Permission.BROWSE, description: 'Browse Only'},
  ],
  [Resource.GALLERY]: [
    {permission: Permission.ADMIN, description: 'Administrator'},
    {permission: Permission.EDIT, description: 'Edit Gallery Contents'},
    {permission: Permission.ADD, description: 'Add Photos'},
    {permission: Permission.BROWSE, description: 'Browse Only'},
  ],
  [Resource.GUESTBOOK]: [
    {permission: Permission.ADMIN, description: 'Administrator'},
    {permission: Permission.BROWSE, description: 'Browse Only'},
  ],
  [Resource.USERS]: [
    {permission: Permission.ADMIN, description: 'Administrator'},
    {permission: Permission.NONE, description: 'None'},
  ]
}

const checkPermission = (user, resource, permission) => {
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
    return userIndex >= 0 && requestedIndex >= 0 && userIndex <= requestedIndex;
  } else {
    return false;
  }
}

module.exports = {
  Resource: Resource,
  Permission: Permission,
  ResourcePermissions : ResourcePermissions,
  checkPermission : checkPermission,
}

