import { store } from '../Redux/store/store'
import { Provider } from 'react-redux'
import MiniMain2 from './MiniMain2'

const MiniIndex2 = () => {
  return (
    <Provider store={store}>
      <MiniMain2 />
    </Provider>
  )
}

export default MiniIndex2