
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Contact from '../pages/Contact';
import Account from '../pages/Account';
import ErrorPage from '../pages/Error';

export const nav = [
    { path:     "/",         name: "Home",        element: <Home />,       isMenu: true,     isPrivate: false  },
    { path:     "/login",    name: "Login",       element: <Login />,      isMenu: false,    isPrivate: false  },
    { path:     "/register", name: "Register",    element: <Register />,   isMenu: false,    isPrivate: false  },
    { path:     "/contact",  name: "Contact",     element: <Contact />,    isMenu: true,     isPrivate: false  },
    { path:     "/account",  name: "Account",     element: <Account />,    isMenu: true,     isPrivate: true   },
    { path:     "/*",        name: "404Error",    element: <ErrorPage />,  isMenu: false,    isPrivate: false  },
]