import { useSelector } from "react-redux";
import { LoginList, CommonList } from "./RouteList";
import { Navigate, Route, Routes } from "react-router-dom";
import MyWallet from "../pages/myWallet";
import Settings from "../pages/settings";
import AddressBookPage from "../pages/myWallet/AddressBook/AddressBookPage";
import TransactionsPage from "../pages/myWallet/TransactionHistory/TransactionsPage";
import TokensPage from "../pages/myWallet/Tokens/TokensPage";
import SecuritySettings from "../pages/settings/Security";
import ServerConfig from "../pages/settings/ServerConfig";
import AccountDetails from "../pages/account";
import Wallets from "../pages/wallets";
// Defined at module scope, NOT inside RouteList.
//
// React identifies a component by its function reference. A guard declared
// inside RouteList is a brand new function on every render, so React treats it
// as a different component type and unmounts the entire page beneath it rather
// than updating it - taking all of that page's local state with it.
//
// RouteList re-renders whenever seedDetailReducer changes, and a completed
// transaction changes it (setTransactionhistory). The visible effect was that
// finishing a send threw the user back to the dashboard and destroyed the
// success dialog before it could be read - which for a token registration
// meant the token id, shown nowhere else and not derivable afterwards, was
// gone. Hoisting the guards keeps their identity stable, so the page updates
// in place and the dialog survives.
const DashBoardAuth = ({ children }: { children: JSX.Element }) => {
  const isLogin = useSelector((state: any) => state.seedDetailReducer.isLogin);
  if (!isLogin) {
    return <Navigate to="/" />;
  }

  return children;
};

const LoginAuth = ({ children }: { children: JSX.Element }) => {
  // Normally logged-in users are bounced away from the login screens, but
  // while explicitly adding another wallet we let them through.
  const isLogin = useSelector((state: any) => state.seedDetailReducer.isLogin);
  const addingWallet = useSelector((state: any) => state.walletsReducer.addingWallet);
  if (isLogin && !addingWallet) {
    return <Navigate to="/mywallet" />;
  }

  return children;
};

const RouteList = () => {

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
        path={"/transactions"}
        element={
          <DashBoardAuth>
            <TransactionsPage />
          </DashBoardAuth>
        }
      />
      <Route
        path={"/tokens"}
        element={
          <DashBoardAuth>
            <TokensPage />
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
      <Route
        path={"/account"}
        element={
          <DashBoardAuth>
            <AccountDetails />
          </DashBoardAuth>
        }
      />
      {/* Wallets picker is reachable while logged out too, so you can switch
          into a saved wallet without re-importing. */}
      <Route path={"/wallets"} element={<Wallets />} />
    </Routes>
  );
};

export default RouteList;
