import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './Redux/store/store';
import { MainRoutes } from './Routes/Route';
async function init() {
  await fetch(window.__rDashboard__.appUrl + "/services.json")
    .then((response) => response.json())
    .then((result) => {
      Object.keys(result).forEach((serviceName) => {
        // @ts-ignore

        window.__rDashboard__[serviceName] = result[serviceName];
      });
    });
}
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
(async () => {
  await init();
  root.render(
    <BrowserRouter basename='/rdashboard'>
      <Provider store={store}>
        <Routes>
          {MainRoutes().map((tools, index) => {
            const Tools = tools.component
            return (<>
              <Route key={index} path={tools.link} element={<Tools />} />
            </>)
          })}
          <Route path='*' element={<h1>notfound</h1>} />
        </Routes>
      </Provider>
    </BrowserRouter>
  );
})();


