import acl from 'acl'
import UserAuthController from '../user/controllers/user.auth.controller'

// Using the memory backend
const aclMemory = new acl(new acl.memoryBackend())

/**
 * Invoke Admin Permissions
 */
exports.invokeRolesPolicies = function () {
  aclMemory.allow([
    {
      roles: ['user', 'admin', 'superadmin'],
      allows: [
        {
          resources: '/api/file/upload',
          permissions: 'post'
        },
        {
          resources: '/api/file/delete/:id',
          permissions: 'put'
        }
      ]
    }
  ])
}

/**
 * Check If Admin Policy Allows
 */
exports.isAllowed = async (req, res, next) => {
  const error = 'User is not authorized'
  try {
    const roles = await UserAuthController.authorize(req)
    const isAllowed = await aclMemory.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase())
    if (isAllowed) {
      return next()
    } else {
      return res.status(401).json({ error })
    }
  } catch (e) {
    return res.status(401).json({ error })
  }
}