import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { HomeIcon, SearchIcon, CalendarIcon, ListIcon, ChefHatIcon, MenuIcon, PlusIcon } from './Icons';

const useResponsive = () => {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isDesktop;
};

const mainNavItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/recipes', label: 'Recipes', icon: SearchIcon },
];

const secondaryNavItems = [
    { path: '/planner', label: 'Planner', icon: CalendarIcon },
    { path: '/grocery-list', label: 'Groceries', icon: ListIcon },
];

const Sidebar: React.FC = () => (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-4">
        <Link to="/" className="flex items-center gap-2 p-4 mb-8">
            <ChefHatIcon className="w-8 h-8 text-brand-orange" />
            <h1 className="text-2xl font-bold text-slate-800">QuickRecipeHub</h1>
        </Link>
        <nav className="flex flex-col gap-2">
            {[...mainNavItems, ...secondaryNavItems].map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive ? 'bg-brand-green text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                        }`
                    }
                >
                    <item.icon className="w-6 h-6" />
                    <span className="font-medium">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    </aside>
);

const BottomNav: React.FC = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 md:hidden z-50">
        {mainNavItems.map(item => (
            <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-1 w-full pt-2 pb-1 transition-colors ${
                    isActive ? 'text-brand-green' : 'text-slate-500 hover:text-brand-green'
                    }`
                }
            >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
        ))}
        
        <button className="bg-brand-orange text-white rounded-full w-14 h-14 flex items-center justify-center -mt-6 shadow-lg hover:bg-brand-orange-dark transition-colors">
            <PlusIcon className="w-8 h-8" />
        </button>

        {secondaryNavItems.map(item => (
            <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-1 w-full pt-2 pb-1 transition-colors ${
                    isActive ? 'text-brand-green' : 'text-slate-500 hover:text-brand-green'
                    }`
                }
            >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
        ))}
    </nav>
);

const MobileHeader: React.FC = () => (
    <header className="bg-white p-4 sticky top-0 z-10 md:hidden shadow-sm">
        <div className="relative flex items-center justify-between h-8">
            <button className="text-slate-600 p-1">
                <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-slate-800 whitespace-nowrap">
                QuickRecipeHub
            </h1>
        </div>
        <div className="mt-4 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input 
                type="search"
                placeholder="Quick find: tags, recipes & more"
                className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green-light focus:border-transparent transition"
            />
        </div>
    </header>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isDesktop = useResponsive();

    return (
        <div className="flex h-screen bg-slate-50">
            {isDesktop && <Sidebar />}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                {!isDesktop && <MobileHeader />}
                {children}
            </main>
            {!isDesktop && <BottomNav />}
        </div>
    );
};

export default Layout;