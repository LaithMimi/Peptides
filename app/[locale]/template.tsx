import { PageView } from "@/components/page-view";

/**
 * Unlike the layout, a template remounts on every navigation between
 * storefront routes, so its <ViewTransition> enters each time and the new
 * page racks into focus. Query-only changes (pagination, research-area
 * picks) keep the same template and are animated by ResultsView instead.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageView>{children}</PageView>;
}
