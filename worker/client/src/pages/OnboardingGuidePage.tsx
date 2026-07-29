import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { EVENTS, emit } from '../lib/events';
import { PHASE_META, taskIsChecked } from '../lib/tasks';
import { IconBookmark, IconCheck } from '../components/Icon';
import type { NavigateFn, User } from '../lib/types';

const PRIORITY_STYLES: Record<string, string> = {
  required: 'border-l-red-400',
  recommended: 'border-l-blue-400',
  optional: 'border-l-gray-300',
};
const PRIORITY_COLORS: Record<string, string> = {
  required: 'bg-red-100 text-red-700',
  recommended: 'bg-blue-100 text-blue-700',
  optional: 'bg-gray-100 text-gray-600',
};
const PRIORITY_LABELS: Record<string, string> = {
  required: 'Required',
  recommended: 'Recommended',
  optional: 'Optional',
};
const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
  pending_approval: { label: '⏳ Awaiting review', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: '✓ Approved', cls: 'bg-green-100 text-green-700' },
  rejected: { label: '↩ Sent back', cls: 'bg-red-100 text-red-700' },
};

interface OnboardingGuidePageProps {
  onNavigate: NavigateFn;
  /** Part of the page contract; the task list is scoped server-side by session. */
  currentUser?: User | null;
}

export function OnboardingGuidePage({ onNavigate }: OnboardingGuidePageProps) {
  const [tasks, setTasks] = useState<any[] | null>(null);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [taskError, setTaskError] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(function () {
    api('/tasks').then(function (r) {
      if (r.success) {
        setTasks(r.data || []);
        return;
      }
      // Without this the page sat on "Loading..." forever on any failure.
      setTasks([]);
      setLoadError(r.error || 'Could not load your onboarding tasks.');
    });
  }, []);

  function toggle(task: any) {
    if (task.my_status === 'approved' || busy) return;
    const done = !taskIsChecked(task.my_status);
    setBusy(task.id);
    setTaskError('');
    api('/tasks/' + task.id + '/status', {
      method: 'PUT',
      body: JSON.stringify({ done: done }),
    }).then(function (r) {
      setBusy(null);
      if (!r.success) {
        // A task already signed off returns 409, and an assigned task that is
        // not yours returns 404. Both used to just spring the checkbox back
        // with no explanation.
        setTaskError(r.error || 'Could not update that task. Please try again.');
        return;
      }
      setTasks(function (prev) {
        return (prev || []).map(function (t) {
          if (t.id !== task.id) return t;
          return Object.assign({}, t, {
            my_status: r.data.status,
            review_notes: done ? t.review_notes : null,
          });
        });
      });
      // Keeps the outstanding-tasks banner in sync.
      emit(EVENTS.TASKS_CHANGED);
    });
  }

  if (tasks === null) {
    return React.createElement(
      'div',
      { className: 'max-w-3xl mx-auto px-4 py-12 text-center text-gray-500' },
      'Loading...'
    );
  }

  const standardTasks = tasks.filter(function (t) {
    return t.audience !== 'assigned';
  });
  const assignedTasks = tasks.filter(function (t) {
    return t.audience === 'assigned';
  });
  const total = tasks.length;
  const done = tasks.filter(function (t) {
    return taskIsChecked(t.my_status);
  }).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  function renderTask(task: any, showPhaseChip: boolean) {
    const isChecked = taskIsChecked(task.my_status);
    const isExpanded = expandedItem === task.id;
    const badge = STATUS_BADGES[task.my_status];
    return React.createElement(
      'div',
      {
        key: task.id,
        // Only fully-approved tasks are muted. "Awaiting review" and "sent back"
        // tasks keep full contrast (with their badge) so action items stay visible.
        className:
          'bg-white rounded-xl border border-toledo-border border-l-4 ' +
          (PRIORITY_STYLES[task.priority] || '') +
          (task.my_status === 'approved' ? ' opacity-60' : ''),
      },
      // Task header row
      React.createElement(
        'div',
        { className: 'flex items-center gap-3 p-4' },
        React.createElement('input', {
          type: 'checkbox',
          checked: isChecked,
          disabled: task.my_status === 'approved' || busy === task.id,
          // The title lives in a sibling button, so this had no accessible
          // name: a screen reader announced "checkbox, not checked" once per
          // task, with nothing to distinguish them — on the app's core
          // interaction.
          'aria-label': task.title,
          onChange: function () {
            toggle(task);
          },
          className:
            'w-4 h-4 rounded-sm border-gray-300 text-toledo-blue focus:ring-toledo-blue cursor-pointer flex-shrink-0 disabled:cursor-not-allowed',
        }),
        React.createElement(
          'button',
          {
            onClick: function () {
              setExpandedItem(isExpanded ? null : task.id);
            },
            className: 'flex-1 flex items-center justify-between text-left min-w-0 group',
          },
          React.createElement(
            'span',
            {
              className:
                'text-sm font-medium ' +
                (task.my_status === 'approved'
                  ? 'line-through text-gray-400'
                  : isChecked
                    ? 'text-gray-500'
                    : 'text-gray-900 group-hover:text-toledo-blue'),
            },
            task.title
          ),
          React.createElement(
            'div',
            { className: 'flex flex-wrap items-center justify-end gap-1.5 flex-shrink-0 ml-3' },
            badge &&
              React.createElement(
                'span',
                { className: 'text-xs px-2 py-0.5 rounded-full font-medium ' + badge.cls },
                badge.label
              ),
            !badge &&
              !!task.requires_approval &&
              React.createElement(
                'span',
                {
                  className:
                    'text-xs px-2 py-0.5 rounded-full font-medium border border-amber-300 text-amber-700',
                },
                'Review required'
              ),
            showPhaseChip &&
              PHASE_META[task.phase] &&
              React.createElement(
                'span',
                {
                  className:
                    'text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600 hidden sm:inline-block',
                },
                PHASE_META[task.phase].label
              ),
            React.createElement(
              'span',
              {
                className:
                  'text-xs px-2 py-0.5 rounded-full font-medium ' +
                  (PRIORITY_COLORS[task.priority] || ''),
              },
              PRIORITY_LABELS[task.priority] || ''
            ),
            React.createElement(
              'span',
              {
                className:
                  'text-gray-400 text-sm transition-transform ' +
                  (isExpanded ? 'rotate-180 inline-block' : 'inline-block'),
              },
              '▾'
            )
          )
        )
      ),
      // Expanded details
      isExpanded &&
        React.createElement(
          'div',
          { className: 'px-4 pb-4 pt-0 border-t border-gray-100' },
          React.createElement(
            'p',
            { className: 'text-sm text-gray-600 pt-3 leading-relaxed' },
            task.description
          ),
          task.my_status === 'rejected' &&
            task.review_notes &&
            React.createElement(
              'div',
              { className: 'mt-3 bg-red-50 rounded-lg p-3 text-sm text-red-700' },
              React.createElement('strong', null, 'Reviewer note: '),
              task.review_notes,
              React.createElement(
                'p',
                { className: 'text-xs text-red-500 mt-1' },
                'Address the note, then check the task off again to resubmit.'
              )
            ),
          !!task.requires_approval &&
            task.my_status !== 'approved' &&
            task.my_status !== 'pending_approval' &&
            React.createElement(
              'p',
              { className: 'mt-2 text-xs text-amber-600' },
              '🔏 An administrator reviews this task after you check it off.'
            ),
          task.my_status === 'pending_approval' &&
            React.createElement(
              'p',
              { className: 'mt-2 text-xs text-amber-600' },
              '⏳ Checked off — waiting for an administrator to confirm.'
            ),
          task.assigned_by_email &&
            React.createElement(
              'p',
              { className: 'mt-2 text-xs text-gray-400' },
              '📌 Assigned to you by ' + task.assigned_by_email
            ),
          task.link_view &&
            React.createElement(
              'button',
              {
                onClick: function () {
                  onNavigate(task.link_view, task.link_param);
                },
                className:
                  'mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-toledo-blue hover:text-toledo-dark border border-toledo-blue/30 hover:border-toledo-blue hover:bg-toledo-blue/5 px-3 py-1.5 rounded-lg transition-colors',
              },
              '📂 Explore full details →'
            )
        )
    );
  }

  const phaseIds = Object.keys(PHASE_META).sort(function (a, b) {
    return PHASE_META[a].order - PHASE_META[b].order;
  });
  const openList = tasks.filter(function (t) {
    return !taskIsChecked(t.my_status);
  });
  const nextTask =
    openList.filter(function (t) {
      return t.priority === 'required';
    })[0] ||
    openList[0] ||
    null;

  return React.createElement(
    'div',
    { className: 'max-w-3xl mx-auto px-4 py-8 fade-in' },
    React.createElement(
      'h1',
      { className: 'display-title text-2xl text-toledo-blue mb-1' },
      'My Onboarding'
    ),
    React.createElement(
      'p',
      { className: 'text-toledo-slate text-sm mb-6' },
      'Work through each phase at your own pace. Expand any task to learn how to complete it, then check it off. Your progress is saved to your account.'
    ),

    (loadError || taskError) &&
      React.createElement(
        'div',
        { className: 'mb-4 bg-red-50 border border-red-200 rounded-lg p-3', role: 'alert' },
        React.createElement('p', { className: 'text-sm text-red-700' }, loadError || taskError)
      ),

    // Next recommended task
    nextTask &&
      React.createElement(
        'div',
        {
          className:
            'bg-white rounded-2xl border border-toledo-border shadow-xs p-5 mb-4 gold-trail',
        },
        React.createElement(
          'p',
          { className: 'text-xs font-bold uppercase tracking-[0.14em] text-toledo-slate mb-1' },
          'Next Recommended Task'
        ),
        React.createElement(
          'div',
          { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-3' },
          React.createElement(
            'div',
            null,
            React.createElement('p', { className: 'font-bold text-toledo-blue' }, nextTask.title),
            React.createElement(
              'p',
              { className: 'text-xs text-toledo-slate mt-0.5' },
              (PHASE_META[nextTask.phase] ? PHASE_META[nextTask.phase].label : '') +
                (nextTask.priority === 'required' ? ' · Required' : '')
            )
          ),
          React.createElement(
            'button',
            {
              onClick: function () {
                setExpandedItem(nextTask.id);
              },
              className:
                'flex-shrink-0 px-4 py-2 bg-toledo-gold text-toledo-blue rounded-lg text-sm font-semibold hover:bg-yellow-300 transition-colors',
            },
            'Show me how'
          )
        )
      ),

    // Sticky progress summary
    React.createElement(
      'div',
      {
        className:
          'bg-white rounded-2xl border border-toledo-border shadow-xs p-5 mb-8 lg:sticky lg:top-16 z-10',
      },
      React.createElement(
        'div',
        { className: 'flex justify-between items-center mb-2' },
        React.createElement(
          'span',
          { className: 'text-sm font-medium text-gray-700' },
          done + ' of ' + total + ' completed'
        ),
        React.createElement(
          'span',
          { className: 'display-title text-lg text-toledo-blue' },
          pct + '%'
        )
      ),
      React.createElement(
        'div',
        { className: 'w-full bg-gray-100 rounded-full h-2.5' },
        React.createElement('div', {
          className:
            'bg-gradient-to-r from-toledo-gold to-yellow-400 h-2.5 rounded-full transition-all duration-300',
          style: { width: pct + '%' },
        })
      ),
      total > 0 &&
        done === total &&
        React.createElement(
          'p',
          { className: 'text-center text-success font-semibold mt-3 text-sm' },
          'You have completed all onboarding tasks!'
        )
    ),

    // Assigned-to-you tasks
    assignedTasks.length > 0 &&
      React.createElement(
        'div',
        { className: 'mb-6' },
        React.createElement(
          'div',
          { className: 'flex items-center gap-3 mb-3' },
          React.createElement(
            'span',
            {
              className:
                'w-8 h-8 rounded-full bg-toledo-blue text-toledo-gold flex items-center justify-center flex-shrink-0',
            },
            React.createElement(IconBookmark)
          ),
          React.createElement(
            'h2',
            { className: 'text-lg font-bold text-gray-900 flex-1' },
            'Assigned to You'
          ),
          React.createElement(
            'span',
            {
              className:
                'text-xs font-medium px-2 py-0.5 rounded-full bg-toledo-gold/20 text-toledo-blue',
            },
            assignedTasks.filter(function (t) {
              return taskIsChecked(t.my_status);
            }).length +
              '/' +
              assignedTasks.length
          )
        ),
        React.createElement(
          'div',
          { className: 'space-y-2' },
          assignedTasks.map(function (task) {
            return renderTask(task, true);
          })
        )
      ),

    // Phases
    phaseIds.map(function (phaseId, phaseIdx) {
      const meta = PHASE_META[phaseId];
      const phaseTasks = standardTasks.filter(function (t) {
        return t.phase === phaseId;
      });
      if (phaseTasks.length === 0) return null;
      const phaseDone = phaseTasks.filter(function (t) {
        return taskIsChecked(t.my_status);
      }).length;
      const phaseComplete = phaseDone === phaseTasks.length;
      return React.createElement(
        'div',
        { key: phaseId, className: 'mb-6' },
        React.createElement(
          'div',
          { className: 'flex items-center gap-3 mb-3' },
          React.createElement(
            'span',
            {
              className:
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ' +
                (phaseComplete ? 'bg-toledo-gold text-toledo-blue' : 'bg-toledo-blue text-white'),
            },
            phaseComplete ? React.createElement(IconCheck) : phaseIdx + 1
          ),
          React.createElement('h2', { className: 'text-lg font-bold text-gray-900 flex-1' }, meta.label),
          React.createElement(
            'span',
            {
              className:
                'text-xs font-medium px-2 py-0.5 rounded-full ' +
                (phaseComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'),
            },
            phaseDone + '/' + phaseTasks.length
          )
        ),
        React.createElement(
          'div',
          { className: 'space-y-2' },
          phaseTasks.map(function (task) {
            return renderTask(task, false);
          })
        )
      );
    })
  );
}
