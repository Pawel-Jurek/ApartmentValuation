import { Navigate, Route, Routes, Link } from "react-router-dom";
import { AuthData } from "../auth/AuthWrapper";
import { nav } from "../auth/navigation";
import React, { useEffect, useState } from "react";

export const RenderRoutes = () => {
     const { user } = AuthData();
     const [isUserLoaded, setIsUserLoaded] = useState(false);
   
     useEffect(() => {
       if (user) {
         const timer = setTimeout(() => {
           setIsUserLoaded(true);
         }, 500);
   
         return () => clearTimeout(timer);
       }
     }, [user]);
   
     if (!isUserLoaded) {
       return <div>Loading...</div>;
     }
   
     return (
       <Routes>
         {nav.map((r, i) => {
           console.log(`Sprawdzam trasę: ${r.path}`);
           if (r.isPrivate) {
               console.log("Strona prywatna:", r.path);
             return user?.isAuthenticated ? (
               <Route key={i} path={r.path} element={r.element} />
             ) : (
               <Route key={i} path={r.path} element={<Navigate to="/login" replace />} />
             );
           }
   
           if (r.path === '/login' && user?.isAuthenticated) {
               console.log("login zalogowany")
             return <Route key={i} path={r.path} element={<Navigate to="/account" replace />} />;
           }
           return <Route key={i} path={r.path} element={r.element} />;
         })}
       </Routes>
     );
   };
   

export const RenderMenu = () => {
     const { user, logout } = AuthData();
   
     const MenuItem = ({ r }) => (
       <div className="menuItem">
         <Link to={r.path}>{r.name}</Link>
       </div>
     );
   
     return (
       <div className="menu">
         {nav
           .filter((r) => {
             if (r.isMenu && !r.isPrivate) return true;
             if (r.isMenu && r.isPrivate && user.isAuthenticated) return true;
             return false;
           })
           .map((r, i) => (
             <MenuItem key={i} r={r} />
           ))}
   
         {user.isAuthenticated ? (
           <div className="menuItem">
             <Link to="#" onClick={logout}>
               Log out
             </Link>
           </div>
         ) : (
           <div className="menuItem">
             <Link to="login">Log in</Link>
           </div>
         )}
       </div>
     );
   };
   