const SA  = 'super_admin';
const SYS = 'system_admin';
const GEN = 'generator';
const APP = 'approver';
const REC = 'recipient';

export const navGroups = [
  {
    group: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', roles: [SA, SYS, GEN, APP, REC], icon: 'home' },
    ],
  },
  {
    group: 'Documents',
    items: [
      { to: '/templates', label: 'Templates',         roles: [SA, SYS],           icon: 'template'    },
      { to: '/generate',  label: 'Generate Document', roles: [SA, SYS, GEN, APP], icon: 'plus-doc'    },
      { to: '/documents', label: 'Documents',         roles: [SA, SYS, GEN, APP, REC], icon: 'doc'    },
    ],
  },
  {
    group: 'Workflow',
    items: [
      { to: '/approvals', label: 'Approvals',       roles: [SA, SYS, APP],           icon: 'check-circle' },
      { to: '/verify-doc', label: 'Verify Document', roles: [SA, SYS, GEN, APP, REC], icon: 'shield'       },
    ],
  },
  {
    group: 'Administration',
    items: [
      { to: '/users',         label: 'Users',         roles: [SA, SYS], icon: 'users'     },
      { to: '/audit',         label: 'Audit Logs',    roles: [SA, SYS], icon: 'clipboard' },
      { to: '/delivery-logs', label: 'Delivery Logs', roles: [SA, SYS], icon: 'mail'      },
    ],
  },
  {
    group: 'Account',
    items: [
      { to: '/settings/system',   label: 'System Settings', roles: [SA],                      icon: 'server'  },
      { to: '/settings/password', label: 'Settings',        roles: [SA, SYS, GEN, APP, REC],  icon: 'cog'     },
    ],
  },
];
