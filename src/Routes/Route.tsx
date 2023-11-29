import { Suspense, lazy } from "react";

const IndividualReportIndex = lazy(() => import("../Individual Dashboard/IndividualReportIndex"));
const RDashBoard = lazy(() => import("../Dashboard/RDashBoard"));
const App = lazy(() => import("../App"));
const Explorer = lazy(() => import("../mini-explorer/MiniIndex"));
const Explorer2 = lazy(() => import("../mini-explorer2/MiniIndex2"));



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
        link: '/project/:projectName/explore2',
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
      {
        label: "Explorer2",
        link: '/project/:projectName/explore',
        component: () => (
          <Suspense fallback={<><span>Loading...</span></>}>
            <Explorer2 />
          </Suspense>
        )
      },
    ]
  )
}
