import React from 'react'
import MiniMain from './MiniMain'
import { store } from '../Redux/store/store'
import { Provider } from 'react-redux'

const MiniIndex = () => {
  return (
    <Provider store={store}>
      <MiniMain />
    </Provider>
  )
}

export default MiniIndex