import React from 'react';

interface IconProps {
  d: string;
  size?: string;
  fill?: string;
  strokeWidth?: number;
}

export function Icon({ d, size = 'w-5 h-5', fill = 'none', strokeWidth = 2 }: IconProps) {
  return React.createElement(
    'svg',
    { className: size, fill, stroke: 'currentColor', viewBox: '0 0 24 24', 'aria-hidden': true },
    React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth, d })
  );
}

/** Builds a stroke icon component from its path data. */
function stroke(d: string, size?: string) {
  return function StrokeIcon() {
    return React.createElement(Icon, size ? { d, size } : { d });
  };
}

export const IconSearch = stroke('M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z');
export const IconPlus = stroke('M12 4v16m8-8H4');
export const IconCheck = stroke('M5 13l4 4L19 7');
export const IconX = stroke('M6 18L18 6M6 6l12 12');
export const IconArrowLeft = stroke('M10 19l-7-7m0 0l7-7m-7 7h18');
export const IconChevronDown = stroke('M19 9l-7 7-7-7', 'w-4 h-4');
export const IconChevronRight = stroke('M9 5l7 7-7 7', 'w-4 h-4');
export const IconSend = stroke('M12 19l9 2-9-18-9 18 9-2zm0 0v-8');
export const IconBookmark = stroke('M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z');
export const IconCheckCircle = stroke('M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z');
export const IconExternalLink = stroke(
  'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
  'w-4 h-4'
);
export const IconFlag = stroke('M3 21V4m0 0l4 2 4-2 4 2 4-2v13l-4 2-4-2-4 2-4-2V4z', 'w-4 h-4');
export const IconLightbulb = stroke(
  'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
);
export const IconUsers = stroke(
  'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
);
export const IconVideo = stroke(
  'M15 10l4.553-2.069A1 1 0 0121 8.807V15.19a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
);
export const IconSparkles = stroke(
  'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
);
export const IconLink = stroke(
  'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
);
export const IconDocument = stroke(
  'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
);
export const IconServer = stroke(
  'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2'
);
export const IconMessageCircle = stroke(
  'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  'w-6 h-6'
);

/** The one filled icon; it does not go through Icon. */
export function IconPlay() {
  return React.createElement(
    'svg',
    { className: 'w-4 h-4', fill: 'currentColor', viewBox: '0 0 24 24', 'aria-hidden': true },
    React.createElement('path', { d: 'M8 5v14l11-7z' })
  );
}

export const IconHome = stroke(
  'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
);
export const IconClipboardCheck = stroke(
  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
);
export const IconGrid = stroke(
  'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
);
export const IconLock = stroke(
  'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
);
export const IconBuilding = stroke(
  'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
);
export const IconScale = stroke(
  'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3'
);
export const IconBriefcase = stroke(
  'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
);
export const IconDesktop = stroke(
  'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
);
export const IconMapPin = stroke(
  'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z'
);
export const IconAcademicCap = stroke(
  'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222'
);
export const IconBell = stroke(
  'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
);
export const IconClock = stroke('M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z');
export const IconMenu = stroke('M4 6h16M4 12h16M4 18h16');

const CATEGORY_ICON_COMPONENTS: Record<string, () => React.ReactElement> = {
  'Department Overview': IconBuilding,
  'NCAA Compliance': IconClipboardCheck,
  'Title IX & Gender Equity': IconScale,
  'NIL (Name, Image & Likeness)': IconBriefcase,
  'HR & Benefits': IconUsers,
  'IT & Campus Access': IconDesktop,
  'Parking & Transportation': IconMapPin,
  'Student-Athlete Development': IconAcademicCap,
  'Relocation & Toledo Life': IconHome,
};

export function CategoryIcon({ name }: { name: string }) {
  const Comp = CATEGORY_ICON_COMPONENTS[name] || IconDocument;
  return React.createElement(
    'span',
    {
      className:
        'w-10 h-10 rounded-xl bg-toledo-blue/8 text-toledo-blue flex items-center justify-center flex-shrink-0',
    },
    React.createElement(Comp)
  );
}
