const AccessControl = require('role-acl');
const permissionsData = require('../data-modules/permissions-data');

module.exports = rbac;

function rbac(options) {
  return async (req, res, next) => {
    let requiredVerb = "";
    if(typeof options.verb === string) {
      requiredVerb = options.verb;
    } else {
      requiredVerb = getVerbFromMethod(req.method)
    }

    // TODO make those two flexible by allowing to pass a function in options that will retrieve them in another way
    let resource = req.params['id']
    let role = req.session['username']

    let rolePermissions = permissionsData.getPermissionsForRole(role);

    let ac = new AccessControl(rolePermissions);
    let permission = await ac.can(role).execute(requiredVerb).on(resource);

    if(permission.granted) {
      req.permission = permission;
      return next();
    } else {
      res.status(403).json({ message: "Not allowed" });
    }
  }
}

function getVerbFromMethod(method) {
  switch (method) {
    case "GET":
      return "read";
      break;
    case "POST":
      return "create";
      break;
    case "PUT":
      return "modify";
      break;
    default:
      return "*";
  }
}
