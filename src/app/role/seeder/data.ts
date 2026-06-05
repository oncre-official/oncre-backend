export const permissions = [
  {
    name: 'manage-users',
    description: 'Can manage users',
  },
  {
    name: 'manage-roles',
    description: 'Can manage roles',
  },
  {
    name: 'manage-permissions',
    description: 'Can manage permissions',
  },
  {
    name: 'manage-orders',
    description: 'Can manage orders',
  },
  {
    name: 'manage-products',
    description: 'Can manage products',
  },
  {
    name: 'manage-wallet',
    description: 'Can manage wallet',
  },
  {
    name: 'manage-recovery',
    description: 'Can manage recovery operations',
  },
  {
    name: 'view-dashboard',
    description: 'Can view dashboard',
  },
];

export const roles = [
  {
    name: 'super-admin',
    permissions: [
      'manage-users',
      'manage-roles',
      'manage-permissions',
      'manage-orders',
      'manage-products',
      'manage-wallet',
      'manage-recovery',
      'view-dashboard',
    ],
  },
  {
    name: 'admin',
    permissions: ['manage-users', 'manage-orders', 'manage-products', 'view-dashboard'],
  },

  {
    name: 'recovery',
    permissions: ['manage-recovery', 'view-dashboard'],
  },
  {
    name: 'sales',
    permissions: ['manage-orders', 'view-dashboard'],
  },
  {
    name: 'field-agent',
    permissions: ['manage-orders', 'view-dashboard'],
  },
  {
    name: 'merchant',
    permissions: ['manage-products', 'manage-orders'],
  },

  {
    name: 'customer',
    permissions: [],
  },
];
