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
export function useGo() {
  const navigate = useNavigate();
  return (to: string) => navigate(to, { viewTransition: true });
}
