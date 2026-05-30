import { Search } from "lucide-react";

const Navbar = () => {
  return (
    <header
      className="
      h-[70px]
      border-b border-white/10
      bg-[#0B1020]/80
      backdrop-blur-xl
      px-6 md:px-8
      flex items-center justify-between
      sticky top-0 z-30
    "
    >
      <div
        className="
        hidden md:flex
        items-center gap-3
        bg-[#12182B]
        border border-white/10
        px-4 py-3
        rounded-2xl
        w-[320px]
      "
      >
        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search activities..."
          className="
          bg-transparent
          outline-none
          text-sm
          w-full
          placeholder:text-gray-500
        "
        />
      </div>

      <div className="flex items-center gap-5 ml-auto">

        <div className="hidden sm:block text-right">
          <h4 className="font-semibold">Administrator</h4>
        </div>

        <div
          className="
          w-11 h-11 rounded-full
          bg-gradient-to-r from-cyan-500 to-violet-500
        "
        />
      </div>
    </header>
  );
};

export default Navbar;