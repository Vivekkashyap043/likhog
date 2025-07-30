import {createBrowserRouter, Navigate, RouterProvider} from 'react-router-dom'
import './App.css';
import RootLayout from './RootLayout'
import {lazy, Suspense, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {restoreUserSession} from './redux/slices/userAuthorSlice'
import LoadingSpinner from './components/LoadingSpinner'
import Home from './components/home/Home';
import Signup from './components/signup/Signup';
import Signin from './components/signin/Signin';
import ForgotPassword from './components/forgot-password/ForgotPassword';
import ResetPassword from './components/reset-password/ResetPassword';
import EmailVerification from './components/email-verification/EmailVerification';
import UserProfile from './components/user-profile/UserProfile';
import AuthorProfile from './components/author-profile/AuthorProfile'
import Articles from './components/articles/Articles';


//import AddArticle from './components/add-article/AddArticle';
import ArticlesByAuthor from './components/articles-by-author/ArticlesByAuthor';
import Article from './components/article/Article';
import ErrorPage from './components/ErrorPage';
//dynamic import of Articles
//const Articles=lazy(()=>import('./components/articles/Articles'))
const AddArticle=lazy(()=>import('./components/add-article/AddArticle'))

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
      },
      {
        path:'/register',
        element:<Signup />
      },
      {
        path:"/login",
        element:<Signin />
      },
      {
        path:"/signin",
        element:<Signin />
      },
      {
        path:"/forgot-password",
        element:<ForgotPassword />
      },
      {
        path:"/reset-password",
        element:<ResetPassword />
      },
      {
        path:"/verify-email",
        element:<EmailVerification />
      },
      {
        path:"/user-profile",
        element:<UserProfile />,
        children:[
          {
            path:"articles",
            element:<Articles />
          },
          {
            path:"article/:articleId",
            element:<Article />
          },
          {
            path:'',
            element:<Navigate to='articles' />
          }
        ]
      },
      {
        path:"/author-profile",
        element:<AuthorProfile />,
        children:[
          {
            path:'new-article',
            element:<Suspense fallback="loading..."><AddArticle /></Suspense> 
          },
          {
            path:'articles-by-author/:author',
            element:<ArticlesByAuthor />,
           
          },
          {
            path:"article/:articleId",
            element:<Article />
          },
          {
            path:'',
            element:<Navigate to='articles-by-author/:author' />
          }
        ]
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
