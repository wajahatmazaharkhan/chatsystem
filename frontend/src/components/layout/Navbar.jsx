import {
    Bell,
    Settings,
    Search,
} from "lucide-react";

export default function Navbar() {
    return (
        <div className="h-20 bg-white border-b px-10 flex justify-between items-center">
            <div className="relative">
                <Search
                    size={18}
                    className="absolute left-4 top-4"
                />

                <input
                    placeholder="Search..."
                    className="w-96 h-12 pl-12 rounded-lg border outline-none"
                />
            </div>

            <div className="flex items-center gap-6">
                <Bell />

                <Settings />

                <div className="flex items-center gap-3">
                    <img
                        src="https://i.pravatar.cc/50"
                        className="rounded-full w-10 h-10"
                    />

                    <div>
                        <h3>Admin</h3>

                        <p className="text-sm text-gray-400">
                            Super Admin
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}