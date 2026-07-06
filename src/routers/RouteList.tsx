import Home from "../pages/login";
import SignIn from "../pages/login/SignIn";
import SignUp from "../pages/login/SignUp";
import DisplaySeed from "../pages/login/DisplaySeed";
import AuthSeed from "../pages/login/AuthSeed";
import MyWallet from "../pages/myWallet";
import Terms from "../pages/term";
import Privacy from "../pages/privacy";
import Settings from "../pages/settings";
import Support from "../pages/support";
interface RouteListObj {
    id: string,
    title: string,
    component: any,
    path: string
}

export const LoginList: Array<RouteListObj> = [
    {
        id: 'home',
        title: 'Home',
        component: <Home/>,
        path: '/'
    },
    {
        id: 'login',
        title: 'Login',
        component: <SignIn/>,
        path: '/login'
    },
    {
        id: 'createNewWallet',
        title: 'Create New Wallet',
        component: <SignUp/>,
        path: '/createNewWallet'
    },
    {
        id: 'displaySeed',
        title: 'Display Seed',
        component: <DisplaySeed/>,
        path: '/displaySeed'
    },
    {
        id: 'authSeed',
        title: 'Auth Seed',
        component: <AuthSeed/>,
        path: '/authSeed'
    },
    // {
    //     id: 'myWallet',
    //     title: 'Wallet',
    //     component: <MyWallet/>,
    //     path: '/mywallet'
    // },
   

    // {
    //     id: 'settings',
    //     title: 'Settings',
    //     component: <Settings/>,
    //     path: '/settings'
    // }
]
export const CommonList: Array<RouteListObj> =[
    {
        id: 'privacy',
        title: 'Privacy',
        component: <Privacy/>,
        path: '/privacy'
    },
    {
        id: 'terms',
        title: 'Terms',
        component: <Terms/>,
        path: '/terms'
    },

    {
        id: 'support',
        title: 'Support',
        component: <Support />,
        path: '/support'
    },
    {
        id: 'website',
        title: 'Website',
        component: '',
        path: '/website'
    },
]


