import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { PageLoader } from './components/logo-loader';

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // 'preserve' stops trailing-slash redirect normalization so the static
    // prerender pass (which requests "<path>/") gets a direct 200 instead of
    // a redirect loop; the splat route strips the slash before lookup.
    trailingSlash: 'preserve',
    scrollRestoration: true,
    defaultPendingComponent: PageLoader,
    defaultPendingMs: 150,
    defaultPendingMinMs: 0,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
