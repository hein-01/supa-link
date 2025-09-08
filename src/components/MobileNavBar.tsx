import { Home, ShoppingBag, Bookmark, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const MobileNavBar = () => {
  const location = useLocation();
  
  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/",
      colors: "text-orange-500"
    },
    {
      id: "stores",
      label: "Stores", 
      icon: ShoppingBag,
      path: "/find-shops",
      colors: "text-yellow-500"
    },
    {
      id: "bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
      path: "/bookmarks",
      colors: "text-teal-500"
    },
    {
      id: "setting",
      label: "Setting",
      icon: Settings,
      path: "/dashboard",
      colors: "text-purple-500"
    }
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-[75px] z-50 md:hidden">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                active ? 'bg-purple-100' : 'hover:bg-gray-50'
              }`}
            >
              <Icon 
                size={20} 
                className={`mb-1 ${active ? item.colors : 'text-gray-500'}`}
              />
              <span className={`text-xs font-medium ${
                active ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavBar;