import React from 'react';
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  useNavigate,
  type LinkProps,
  type NavLinkProps,
} from 'react-router-dom';

/**
 * Site links: React Router's Link / NavLink with view transitions on by default, so every page
 * change crossfades (index.css: ::view-transition-*). Browsers without the API just navigate.
 * Use these instead of importing Link / NavLink from react-router-dom.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => (
  <RouterLink ref={ref} viewTransition {...props} />
));
Link.displayName = 'Link';

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>((props, ref) => (
  <RouterNavLink ref={ref} viewTransition {...props} />
));
NavLink.displayName = 'NavLink';

/** navigate() with the same page transition, for the shell and the command palette. */
// eslint-disable-next-line react-refresh/only-export-components -- one import for Link, NavLink and useGo (see CLAUDE.md)
export function useGo() {
  const navigate = useNavigate();
  return (to: string) => navigate(to, { viewTransition: true });
}

/**
 * The view-transition name an article's title carries on its page, and on the one list entry being
 * opened or left (`useViewTransitionState(path)`), so the title itself moves between the two. A
 * name must be on one element at a time: never set it on every entry of a list.
 */
// eslint-disable-next-line react-refresh/only-export-components -- shared with the pages that hand a title over
export const POST_TITLE: React.CSSProperties = { viewTransitionName: 'post-title' };
