import { Suspense, lazy } from "react";
const IndividualReportIndex = lazy(() => import("../Individual Dashboard/IndividualReportIndex"));
const RDashBoard = lazy(() => import("../Dashboard/RDashBoard"));
const App = lazy(() => import("../App"));
const Explorer = lazy(() => import("../mini-explorer/MiniIndex"));



export const MainRoutes = () => {
  return (
    [
      {
        label: "App",
        link: '/',
        type: true,
        component: () => (
          <Suspense fallback={<><span>Loading...</span></>}>
            <App />
          </Suspense>
        )
      },

      {
        label: "Dashboard",
        link: '/project/:projectName',
        component: () => (
          <Suspense fallback={<><span>Loading...</span></>}>
            <RDashBoard />
          </Suspense>
        )
      },

      {
        label: "Explorer",
        link: '/project/:projectName/explore',
        component: () => (
          <Suspense fallback={<><span>Loading...</span></>}>
            <Explorer />
          </Suspense>
        )
      },
      {
        label: "IndividualReport",
        link: '/project/:projectName/stats/:name',
        type: true,
        component: () => (
          <Suspense fallback={<><span>Loading...</span></>}>
            <IndividualReportIndex />
          </Suspense>
        )
      },
    ]
  )
}
