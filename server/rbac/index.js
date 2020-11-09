const AccessControl = require('role-acl');

const grants = {
  admin: {
    grants: [
      {
        resource: 'farmer',
        action: '*',
        attributes: ['*']
      },
      {
        resource: 'order',
        action: '*',
        attributes: ['*']
      }
    ]
  },
  user: {
    grants: [
      {
        resource: 'order',
        action: ['read', 'modify', 'list'],
        attributes: ['*'],
        condition: {
          Fn: 'EQUALS',
          args: {
            'requester': '$.created_by'
          }
        }
      },
      {
        resource: 'order',
        action: 'create'
      }
    ]
  },
  farmer: {
    grants: [
      {
        resource: 'farmer',
        action: ['modify'],
        attributes: ['*', '!owner'],
        condition: {
          Fn: 'EQUALS',
          args: {
            'requester': '$.owner'
          }
        }
      },
      {
        resource: 'order',
        action: ['read', 'list', 'complete'],
        attributes: ['products', 'completed', 'payed', 'name'],
        condition: {
          Fn: 'EQUALS',
          args: {
            'requester': '$.farmer_id_on_order'
          }
        }
      }
    ]
  }
}

module.exports = new AccessControl(grants);
