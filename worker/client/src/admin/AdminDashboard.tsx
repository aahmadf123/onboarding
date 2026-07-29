import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  IconBell,
  IconCheckCircle,
  IconClipboardCheck,
  IconDocument,
  IconFlag,
  IconLock,
  IconSend,
  IconServer,
  IconUsers,
} from '../components/Icon';
import { AdminUsers } from './AdminUsers';
import { AdminTasks } from './AdminTasks';
import { AdminApprovals } from './AdminApprovals';
import { AdminBehind } from './AdminBehind';
import { AdminFeedback } from './AdminFeedback';
import { AdminContent } from './AdminContent';
import { AdminEmailLog } from './AdminEmailLog';
import { AdminSettings } from './AdminSettings';
import type { NavigateFn, User } from '../lib/types';

interface AdminDashboardProps {
  currentUser: User | null;
  /** Part of the page contract; the admin shell has its own section nav. */
  onNavigate?: NavigateFn;
}

export function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [section, setSection] = useState('users');
  const [pendingCount, setPendingCount] = useState(0);
  const [openFeedback, setOpenFeedback] = useState(0);

  useEffect(function () {
    api('/admin/approvals').then(function (r) {
      if (r.success) setPendingCount((r.data || []).length);
    });
    api('/admin/feedback?status=open').then(function (r) {
      if (r.success) setOpenFeedback(r.open_count || 0);
    });
  }, []);

  const sections = [
    { id: 'users', label: 'Users', icon: IconUsers },
    { id: 'tasks', label: 'Tasks', icon: IconClipboardCheck },
    {
      id: 'approvals',
      label: 'Approvals' + (pendingCount > 0 ? ' (' + pendingCount + ')' : ''),
      icon: IconCheckCircle,
    },
    { id: 'behind', label: 'Who Is Behind', icon: IconBell },
    {
      id: 'feedback',
      label: 'Reported Issues' + (openFeedback > 0 ? ' (' + openFeedback + ')' : ''),
      icon: IconFlag,
    },
    { id: 'content', label: 'Content', icon: IconDocument },
    { id: 'email', label: 'Email Log', icon: IconSend },
    { id: 'settings', label: 'Settings', icon: IconServer },
  ];

  let body;
  if (section === 'users') body = React.createElement(AdminUsers, { currentUser: currentUser });
  else if (section === 'tasks') body = React.createElement(AdminTasks);
  else if (section === 'approvals')
    body = React.createElement(AdminApprovals, { onCountChange: setPendingCount });
  else if (section === 'behind') body = React.createElement(AdminBehind);
  else if (section === 'feedback')
    body = React.createElement(AdminFeedback, { onCountChange: setOpenFeedback });
  else if (section === 'content') body = React.createElement(AdminContent);
  else if (section === 'email') body = React.createElement(AdminEmailLog);
  else body = React.createElement(AdminSettings);

  return React.createElement(
    'div',
    { className: 'max-w-7xl mx-auto px-4 py-8 fade-in' },
    React.createElement(
      'div',
      { className: 'flex items-center gap-3 mb-1' },
      React.createElement(
        'span',
        {
          className:
            'w-9 h-9 rounded-xl bg-toledo-blue text-toledo-gold flex items-center justify-center flex-shrink-0',
        },
        React.createElement(IconLock)
      ),
      React.createElement('h1', { className: 'display-title text-2xl text-toledo-blue' }, 'Admin')
    ),
    React.createElement(
      'p',
      { className: 'text-toledo-slate text-sm mb-6' },
      'Manage users, tasks, approvals, and every piece of site content.'
    ),
    React.createElement(
      'div',
      { className: 'flex flex-col md:flex-row gap-6' },
      React.createElement(
        'nav',
        { className: 'md:w-48 flex md:flex-col gap-1 flex-wrap flex-shrink-0' },
        sections.map(function (s) {
          return React.createElement(
            'button',
            {
              key: s.id,
              onClick: function () {
                setSection(s.id);
              },
              className:
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ' +
                (section === s.id ? 'bg-toledo-blue text-white' : 'text-gray-600 hover:bg-gray-100'),
            },
            React.createElement(s.icon),
            s.label
          );
        })
      ),
      React.createElement('div', { className: 'flex-1 min-w-0' }, body)
    )
  );
}
