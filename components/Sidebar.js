import Link from "next/link";
import { useRouter } from "next/router";
import { useSidebar } from "./Layout";

export default function Sidebar() {
  const router = useRouter();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const menuItems = [
    {
      href: "/dashboard",
      icon: "📊",
      title: "Master Barang",
      desc: "Kelola semua data barang",
    },
    {
      href: "/barang",
      icon: "📋",
      title: "Tambah Barang",
      desc: "Menambah data barang baru",
    },
    {
      href: "/barang-masuk",
      icon: "📦",
      title: "Barang Masuk",
      desc: "Input barang masuk",
    },
    {
      href: "/barang-keluar",
      icon: "📤",
      title: "Barang Keluar",
      desc: "Input barang keluar",
    },
    {
      href: "/supplier",
      icon: "🏭",
      title: "Supplier",
      desc: "Kelola data supplier",
    },
    {
      href: "/log-transaksi",
      icon: "📄",
      title: "Log Transaksi",
      desc: "Riwayat semua transaksi",
    },
  ];

  const isActive = (href) => {
    return router.pathname === href;
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } h-screen fixed left-0 top-0 z-40`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/">
              <div className="cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md">
                <h1 className="text-lg font-bold text-gray-800 transition-colors duration-200">
                  IT Documentation
                </h1>
                <p className="text-xs text-gray-500 transition-colors duration-200">
                  PT Trimas Sarana <br /> Garment Industry
                </p>
              </div>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 ease-in-out transform hover:scale-110 hover:shadow-md"
          >
            <svg
              className="w-5 h-5 text-gray-600 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="p-2">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center p-3 rounded-lg mb-1 cursor-pointer transition-all duration-300 ease-in-out transform sidebar-item ${
                  active
                    ? "bg-blue-50 text-blue-700 border-r-4 border-blue-500 shadow-md scale-105"
                    : "text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-105 hover:border-l-4 hover:border-blue-300"
                }`}
              >
                <span className="text-xl mr-3 flex-shrink-0 transition-transform duration-200 hover:scale-110">
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium transition-colors duration-200 ${
                        active ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate transition-colors duration-200">
                      {item.desc}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">© 2025 Made by finnn16</p>
          </div>
        </div>
      )}
    </div>
  );
}
