import { Suspense, lazy } from "react";
const IndividualReport = lazy(() => import("../Individual Dashboard/Individual Reports/IndividualReport"));
const IndividualReportIndex = lazy(() => import("../Individual Dashboard/IndividualReportIndex"));
const RDashBoard = lazy(() => import("../Dashboard/RDashBoard"));
const App = lazy(() => import("../App"));



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

      // {
      //   label: "IndividualReport",
      //   link: '/project/:projectName/stats/:name',
      //   component: () => (
      //     <Suspense fallback={<><span>Loading...</span></>}>
      //       <IndividualReport />
      //     </Suspense>
      //   )
      // },
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
