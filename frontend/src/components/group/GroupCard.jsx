import { useNavigate } from "react-router-dom";

export default function GroupCard({ group }) {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-xl">
                {group.name}
            </h2>

            <p className="mt-2">
                Members: {group.members.length}
            </p>

            <p className="mt-2">
                Manager:{" "}
                {group.manager_id ? group.manager_id : "Not Assigned"}
            </p>

            <button
                onClick={() =>
                    navigate(`/groups/${group._id}`)
                }
                className="mt-4 text-blue-700 font-semibold"
            >
                View Group
            </button>
        </div>
    );
}