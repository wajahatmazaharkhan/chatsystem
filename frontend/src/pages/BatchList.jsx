import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAllBatches } from "../services/batchService";
import BatchTable from "../components/batch/BatchTable";
import Loader from "../components/ui/Loader";

export default function BatchList() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchBatches();
    }, []);

    async function fetchBatches() {
        try {
            const res = await getAllBatches();

            setBatches(res.data);
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
            <h1 className="text-4xl font-bold mb-8">
                Batches
            </h1>

            <button 
                className="mt-3 mb-2 bg-blue-700 text-white px-6 py-3 rounded-lg"
                onClick={() =>
                    navigate(`/batches/create`)
                  }
            >Create new batch</button>

            <BatchTable batches={batches} />
        </div>
    );
}