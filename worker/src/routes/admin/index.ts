import { Hono } from 'hono';
import { AppEnv } from '../../types';
import { requireRole } from '../../middleware/auth';
import users from './users';
import tasks from './tasks';
import approvals from './approvals';
import content from './content';
import settings from './settings';
import emailLog from './email-log';

// Everything under /api/admin/* is super-admin only.
const admin = new Hono<AppEnv>();
admin.use('*', requireRole('admin'));

admin.route('/users', users);
admin.route('/tasks', tasks);
admin.route('/approvals', approvals);
admin.route('/content', content);
admin.route('/settings', settings);
admin.route('/email-log', emailLog);

export default admin;
