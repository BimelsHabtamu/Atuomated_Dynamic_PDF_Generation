export const navGroups = [
  {
    group: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard',        roles: ['admin','generator','approver','recipient'], icon: 'home' },
    ],
  },
  {
    group: 'Documents',
    items: [
      { to: '/templates', label: 'Templates',         roles: ['admin'],                        icon: 'template' },
      { to: '/generate',  label: 'Generate Document', roles: ['admin','generator','approver'], icon: 'plus-doc' },
      { to: '/documents', label: 'Documents',         roles: ['admin','generator'],             icon: 'doc' },
    ],
  },
  {
    group: 'Workflow',
    items: [
      { to: '/approvals', label: 'Approvals',         roles: ['admin','approver'],                              icon: 'check-circle' },
      { to: '/verify',    label: 'Verify Document',   roles: ['admin','generator','approver','recipient'],      icon: 'shield' },
    ],
  },
  {
    group: 'Administration',
    items: [
      { to: '/users',         label: 'Users',         roles: ['admin'], icon: 'users' },
      { to: '/audit',         label: 'Audit Logs',    roles: ['admin'], icon: 'clipboard' },
      { to: '/delivery-logs', label: 'Delivery Logs', roles: ['admin'], icon: 'mail' },
      { to: '/settings',      label: 'Settings',      roles: ['admin'], icon: 'cog' },
    ],
  },
];
