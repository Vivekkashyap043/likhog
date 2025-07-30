import {createBrowserRouter, Navigate, RouterProvider} from 'react-router-dom'
import './App.css';
import RootLayout from './RootLayout'
import {lazy, Suspense, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {restoreUserSession} from './redux/slices/userAuthorSlice'
import LoadingSpinner from './components/LoadingSpinner'
import Home from './components/home/Home';
import ErrorPage from './components/ErrorPage';

function App() {
  const dispatch = useDispatch();
  const { isSessionRestored, isPending } = useSelector(
    (state) => state.userAuthorLoginReducer
  );

  useEffect(() => {
    // Try to restore user session when app loads
    dispatch(restoreUserSession());
  }, [dispatch]);

  // Show loading screen while session is being restored
  if (!isSessionRestored && isPending) {
    return <LoadingSpinner />;
  }

  const browserRouter=createBrowserRouter([{
    path:'',
    element:<RootLayout />,
    errorElement:<ErrorPage />,
    children:[
      {
        path:'',
        element:<Home />
      }
    ]
  }])

  return (
    <div style={{fontFamily:"sans-serif"}}>
      <RouterProvider router={browserRouter} />
    </div>
  );
}

export default App;
