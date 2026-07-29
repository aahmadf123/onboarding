import React, { useEffect, useState } from 'react';
import type { NavigateFn } from '../lib/types';

interface TourStep {
  icon: string;
  title: string;
  body: string;
  target: string | null;
  cta: { label: string; view: string; param: string | null } | null;
}

export const TOUR_STEPS: TourStep[] = [
  {
    icon: '👋',
    title: 'Welcome to Toledo Athletics!',
    body: 'This portal has everything you need to get settled in — from your first-day checklist to policies, key contacts, and more. This quick tour will show you around.',
    target: null,
    cta: null,
  },
  {
    icon: '🗺️',
    title: 'My Onboarding',
    body: 'Your personal onboarding checklist walks you through every phase — First Day, First Week, First Month, and First 90 Days. Check tasks off as you complete them and track your progress.',
    target: '[data-tour="guide"]',
    cta: { label: 'Go to My Onboarding', view: 'guide', param: null },
  },
  {
    icon: '📚',
    title: 'Explore by Topic',
    body: 'Browse 9 topic areas: Department Overview, NCAA Compliance, IT & Campus Access, HR & Benefits, Parking, and more. Each topic has detailed articles written for Athletics staff.',
    target: '[data-tour="categories"]',
    cta: { label: 'Browse Topics', view: 'categories', param: null },
  },
  {
    icon: '👥',
    title: 'Key Contacts & Resources',
    body: 'Not sure who to call? People & Contacts lists key people across the department, and Systems & Tools (in the left sidebar) has direct links to every system you need — MyUT, Teamworks, TimeClock Plus, and more.',
    target: '[data-tour="contacts"]',
    cta: { label: 'See Key Contacts', view: 'contacts', param: null },
  },
  {
    icon: '✏️',
    title: 'Contribute Knowledge',
    body: 'Have insights to share? Use the Contribute page to propose new articles or suggest edits to existing ones. All submissions are reviewed before publishing.',
    target: '[data-tour="submit"]',
    cta: { label: 'Contribute', view: 'submit', param: null },
  },
  {
    icon: '✨',
    title: 'AI Assistant',
    body: 'See the gold "Ask AI Guide" button in the bottom-right corner? That is your AI assistant, scoped to Toledo Athletics onboarding topics. Ask it anything — policies, procedures, who to contact, how to set up parking.',
    target: '[data-tour="ai-chat"]',
    cta: null,
  },
];

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourCardProps {
  current: TourStep;
  step: number;
  isLast: boolean;
  advance: () => void;
  goAndDone: (view: string, param: string | null) => void;
  onDone: () => void;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

function TourCard({ current, step, isLast, advance, goAndDone, onDone, setStep }: TourCardProps) {
  return React.createElement(
    'div',
    { className: 'bg-white rounded-2xl shadow-2xl w-full max-w-md fade-in overflow-hidden' },
    // Progress bar
    React.createElement(
      'div',
      { className: 'h-1 bg-gray-100' },
      React.createElement('div', {
        className: 'h-1 bg-toledo-blue transition-all duration-500',
        style: { width: ((step + 1) / TOUR_STEPS.length) * 100 + '%' },
      })
    ),
    React.createElement(
      'div',
      { className: 'p-6' },
      // Step indicator
      React.createElement(
        'div',
        { className: 'flex items-center justify-between mb-4' },
        React.createElement(
          'div',
          { className: 'flex gap-1.5' },
          TOUR_STEPS.map(function (_, i) {
            return React.createElement('div', {
              key: i,
              className:
                'h-1.5 rounded-full transition-all duration-300 ' +
                (i === step
                  ? 'w-6 bg-toledo-blue'
                  : i < step
                    ? 'w-1.5 bg-toledo-blue/40'
                    : 'w-1.5 bg-gray-200'),
            });
          })
        ),
        React.createElement(
          'span',
          { className: 'text-xs text-toledo-slate font-medium' },
          step + 1 + ' / ' + TOUR_STEPS.length
        )
      ),
      // Icon
      React.createElement(
        'div',
        {
          className:
            'w-12 h-12 bg-toledo-blue/8 rounded-xl flex items-center justify-center text-2xl mb-4 mx-auto',
        },
        current.icon
      ),
      // Content
      React.createElement(
        'h2',
        { className: 'text-lg font-bold text-gray-900 text-center mb-2' },
        current.title
      ),
      React.createElement(
        'p',
        { className: 'text-sm text-gray-500 text-center leading-relaxed mb-5' },
        current.body
      ),
      // CTA
      current.cta &&
        React.createElement(
          'button',
          {
            onClick: function () {
              goAndDone(current.cta!.view, current.cta!.param);
            },
            className:
              'w-full mb-3 py-2 border-2 border-toledo-blue text-toledo-blue rounded-xl text-sm font-semibold hover:bg-toledo-blue hover:text-white transition-colors',
          },
          current.cta.label
        ),
      // Navigation
      React.createElement(
        'div',
        { className: 'flex items-center gap-3' },
        step > 0 &&
          React.createElement(
            'button',
            {
              onClick: function () {
                setStep(function (s) {
                  return s - 1;
                });
              },
              className:
                'flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors',
            },
            '← Back'
          ),
        React.createElement(
          'button',
          {
            onClick: advance,
            className:
              'flex-1 py-2 text-sm font-semibold text-white bg-toledo-blue hover:bg-toledo-dark rounded-xl transition-colors',
          },
          isLast ? '🎉 Lets go!' : 'Next →'
        )
      ),
      // Skip
      !isLast &&
        React.createElement(
          'button',
          {
            onClick: onDone,
            className:
              'w-full mt-3 text-xs text-toledo-slate hover:text-gray-600 transition-colors py-1',
          },
          'Skip tour'
        )
    )
  );
}

interface QuickTourProps {
  onDone: () => void;
  onNavigate: NavigateFn;
}

export function QuickTour({ onDone, onNavigate }: QuickTourProps) {
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  // Find and measure the target element for the spotlight.
  useEffect(
    function () {
      if (!current.target) {
        setSpotlightRect(null);
        return;
      }
      const el = document.querySelector(current.target);
      const rect = el?.getBoundingClientRect();

      // A hidden element measures zero. Four of the six targets live in the
      // desktop sidebar, which is display:none below lg, so on a phone the
      // spotlight framed a 12px dot in the top-left corner and the tour — the
      // first thing a new hire sees — looked broken. Falling back to the
      // centred card gives them the same copy without the false pointer.
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        setSpotlightRect(null);
        return;
      }

      setSpotlightRect({
        top: rect.top + window.scrollY - 6,
        left: rect.left - 6,
        width: rect.width + 12,
        height: rect.height + 12,
      });
      el!.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    [step]
  );

  function advance() {
    if (isLast) {
      onDone();
    } else {
      setStep(function (s) {
        return s + 1;
      });
    }
  }

  function goAndDone(view: string, param: string | null) {
    onDone();
    onNavigate(view, param);
  }

  const card = React.createElement(TourCard, {
    current,
    step,
    isLast,
    advance,
    goAndDone,
    onDone,
    setStep,
  });

  if (!spotlightRect) {
    // No target: full overlay with centered card
    return React.createElement(
      'div',
      { style: { position: 'fixed', inset: 0, zIndex: 100 } },
      React.createElement('div', {
        className: 'fixed inset-0 transition-all duration-500',
        style: { background: 'rgba(11,34,64,0.75)', zIndex: 100 },
        onClick: function (e: React.MouseEvent) {
          e.stopPropagation();
        },
      }),
      React.createElement(
        'div',
        {
          className: 'fixed inset-0 flex items-center justify-center p-4',
          style: { zIndex: 110 },
        },
        card
      )
    );
  }

  // With target: spotlight with cutout
  const clipPath =
    'polygon(0% 0%, 0% 100%, ' +
    spotlightRect.left +
    'px 100%, ' +
    spotlightRect.left +
    'px ' +
    spotlightRect.top +
    'px, ' +
    (spotlightRect.left + spotlightRect.width) +
    'px ' +
    spotlightRect.top +
    'px, ' +
    (spotlightRect.left + spotlightRect.width) +
    'px ' +
    (spotlightRect.top + spotlightRect.height) +
    'px, ' +
    spotlightRect.left +
    'px ' +
    (spotlightRect.top + spotlightRect.height) +
    'px, ' +
    spotlightRect.left +
    'px 100%, 100% 100%, 100% 0%)';

  const viewportW = window.innerWidth;
  const tooltipW = Math.min(360, viewportW - 32);
  let leftPos = spotlightRect.left + spotlightRect.width / 2 - tooltipW / 2;
  if (leftPos < 16) leftPos = 16;
  if (leftPos + tooltipW > viewportW - 16) leftPos = viewportW - tooltipW - 16;

  return React.createElement(
    'div',
    { style: { position: 'absolute', inset: 0, zIndex: 100, minHeight: '100%', pointerEvents: 'none' } },
    // Dark backdrop with cutout
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        minHeight: document.documentElement.scrollHeight + 'px',
        background: 'rgba(11,34,64,0.7)',
        clipPath: clipPath,
        transition: 'clip-path 0.5s ease-in-out',
        pointerEvents: 'auto',
        zIndex: 100,
      },
      onClick: function (e: React.MouseEvent) {
        e.stopPropagation();
      },
    }),
    // Spotlight ring
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: spotlightRect.top + 'px',
        left: spotlightRect.left + 'px',
        width: spotlightRect.width + 'px',
        height: spotlightRect.height + 'px',
        borderRadius: '8px',
        boxShadow: '0 0 0 3px rgba(255,205,0,0.8), 0 0 20px rgba(255,205,0,0.3)',
        transition: 'all 0.5s ease-in-out',
        pointerEvents: 'none',
        zIndex: 105,
      },
    }),
    // Tooltip card positioned near spotlight
    React.createElement(
      'div',
      {
        style: {
          position: 'absolute',
          top: spotlightRect.top + spotlightRect.height + 16 + 'px',
          left: leftPos + 'px',
          width: tooltipW + 'px',
          zIndex: 110,
          pointerEvents: 'auto',
        },
      },
      card
    )
  );
}
