import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { getBatchById } from "../services/batchService";

import Loader from "../components/ui/Loader";

import GroupCard from "../components/group/GroupCard";

export default function BatchDetails() {
    const { id } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBatch();
    }, []);

    async function fetchBatch() {
        try {
            const res = await getBatchById(id);

            setData(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <h1 className="text-4xl font-bold">
                {data.batch.name}
            </h1>

            <div className="grid grid-cols-3 gap-6 my-8">
                <div className="bg-white p-6 rounded-xl">
                    <p>Students</p>

                    <h2 className="text-3xl font-bold">
                        {
                            data.groups.reduce((total, group) => total + group.members.length, 0)
                        }
                    </h2>
                </div>

                <div className="bg-white p-6 rounded-xl">
                    <p>Groups</p>

                    <h2 className="text-3xl font-bold">
                        {data.total_groups}
                    </h2>
                </div>

                <div className="bg-white p-6 rounded-xl">
                    <p>Created</p>

                    <p>
                        {new Date(data.batch.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {data.groups.map((group) => (
                    <GroupCard
                        key={group._id}
                        group={group}
                    />
                ))}
            </div>
        </div>
    );
}