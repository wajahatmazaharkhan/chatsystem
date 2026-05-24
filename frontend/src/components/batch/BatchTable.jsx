import { useNavigate } from "react-router-dom";

export default function BatchTable({ batches }) {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-4 text-left">
                            Name
                        </th>

                        <th className="p-4">
                            Students
                        </th>

                        <th className="p-4">
                            Created
                        </th>

                        <th className="p-4">
                            Action
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {batches.map((batch) => (
                        <tr
                            key={batch._id}
                            className="border-b"
                        >
                            <td className="p-4">
                                {batch.name}
                            </td>

                            <td className="text-center">
                                {batch.student_ids ? batch.student_ids.length : "-"}
                            </td>

                            <td className="text-center">
                                {new Date(batch.created_at).toLocaleDateString()}
                            </td>

                            <td className="text-center">
                                <button
                                    onClick={() =>
                                        navigate(`/batches/${batch._id}`)
                                    }
                                    className="text-blue-700 font-semibold"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}