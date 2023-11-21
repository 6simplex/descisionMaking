import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../Redux/store/store';
import IndividualReportMain from './IndividualReportMain';

const IndividualReportIndex = () => {
    return (
        <Provider store={store}>
            <IndividualReportMain />
        </Provider>
    )
}

export default IndividualReportIndex;


