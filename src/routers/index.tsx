import { useSelector } from "react-redux";
import { LoginList, CommonList } from "./RouteList";
import { Navigate, Route, Routes } from "react-router-dom";
import MyWallet from "../pages/myWallet";
import Settings from "../pages/settings";
import AddressBookPage from "../pages/myWallet/AddressBook/AddressBookPage";
import SecuritySettings from "../pages/settings/Security";
import ServerConfig from "../pages/settings/ServerConfig";
const RouteList = () => {
  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const DashBoardAuth = ({ children }: { children: JSX.Element }) => {
    if (!walletDetails.isLogin) {
      return <Navigate to="/" />;
    }

    return children;
  };
  const LoginAuth = ({ children }: { children: JSX.Element }) => {
    if (walletDetails.isLogin) {
      return <Navigate to="/mywallet" />;
    }

    return children;
  };

  return (
    <Routes>
      {LoginList.map((route: any) => (
        <Route
          key={route.id}
          path={route.path}
          element={<LoginAuth>{route.component}</LoginAuth>}
        />
      ))}
      {CommonList.map((route: any) => (
        <Route key={route.id} path={route.path} element={route.component} />
      ))}
      <Route
        path={"/mywallet"}
        element={
          <DashBoardAuth>
            <MyWallet />
          </DashBoardAuth>
        }
      />
      <Route
        path={"/settings"}
        element={
          <DashBoardAuth>
            <Settings />
          </DashBoardAuth>
        }
      />
      <Route
        path={"/addressbook"}
        element={
          <DashBoardAuth>
            <AddressBookPage />
          </DashBoardAuth>
        }
      />
      <Route
        path={"/security"}
        element={
          <DashBoardAuth>
            <SecuritySettings />
          </DashBoardAuth>
        }
      />
      <Route
        path={"/server"}
        element={<ServerConfig />}
      />
    </Routes>
  );
};

export default RouteList;
