import { useEffect, useState } from "react";
import StatsCards from "../../components/activityMonitoring/StatsCards";
import ActivityTable from "../../components/activityMonitoring/ActivityTable";
import {
  fetchAdminStats,
  getActivityLogs,
  getBatchOverview,
} from "../../services/analyticsService";
import BatchOverviewTable from "../../components/activityMonitoring/BatchOverviewTable";

export default function ActivityMonitoring() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({});
  const [batchOverview, setBatchOverview] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [statsLoading, setStatsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(true);

  // Filters (will implement backend later)
  const initialFilters = {
    batch: "",
    activity_type: "",
    status: "",
    search: "",
    from: "",
    to: "",
  };

  const [filters, setFilters] = useState(initialFilters);

  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const loadStats = async () => {
    try {
      setStatsLoading(true);

      const batchId = selectedBatch?.batch_id;

      const data = await fetchAdminStats(batchId);

      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      setActivitiesLoading(true);

      const batchId = selectedBatch?.batch_id;

      const logsRes = await getActivityLogs({
        page,
        limit,
        ...appliedFilters,
        batch_id: batchId,
      });

      setActivities(logsRes.data || []);
      setPagination(logsRes.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const loadBatchOverview = async () => {
    try {
      setBatchLoading(true);

      const batchRes = await getBatchOverview();

      setBatchOverview(batchRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setBatchLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [selectedBatch]);

  useEffect(() => {
    loadBatchOverview();
  }, []);

  useEffect(() => {
    loadActivities();
  }, [page, appliedFilters, selectedBatch]);

  return (
    <div className="p- space-y-8 bg-slate-950 min-h-screen">
      {/* Header */}

      <div>
        <h1 className="text-4xl font-bold text-white">
          {selectedBatch
            ? `${selectedBatch.batch_name} Activity Dashboard`
            : "Activity Monitoring Dashboard"}
        </h1>

        <p className="text-gray-400 mt-3">
          {selectedBatch
            ? `Monitor activities, engagement and inactivity for ${selectedBatch.batch_name}.`
            : "Monitor user activities, engagement and inactivity across all batches."}
        </p>
      </div>

      {/* Stats */}

      <StatsCards
        stats={stats}
        loading={statsLoading}
        selectedBatch={selectedBatch}
      />

      {/* Filters */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="grid grid-cols-6 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <select
            value={filters.batch}
            onChange={(e) => {
              const value = e.target.value;

              setFilters({
                ...filters,
                batch: value,
              });

              const batch =
                batchOverview.find((b) => b.batch_id === value) || null;

              setSelectedBatch(batch);
            }}
            className="bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700"
          >
            <option value="">All Batches</option>

            {batchOverview.map((batch) => (
              <option key={batch.batch_id} value={batch.batch_id}>
                {batch.batch_name}
              </option>
            ))}
          </select>

          <select
            value={filters.activity_type}
            onChange={(e) =>
              setFilters({
                ...filters,
                activity_type: e.target.value,
              })
            }
            className="bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700"
          >
            <option value="">All Activities</option>
            <option value="LOGIN">Login</option>
            <option value="MESSAGE">Message</option>
            <option value="INTERACTION">Interaction</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value,
              })
            }
            className="bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <input
            placeholder="Search user..."
            value={filters.search}
            onChange={(e) =>
              setFilters({
                ...filters,
                search: e.target.value,
              })
            }
            className="bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700"
          />

          <input
            type="date"
            value={filters.from}
            onChange={(e) =>
              setFilters({
                ...filters,
                from: e.target.value,
              })
            }
            className="bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700"
          />

          <input
            type="date"
            value={filters.to}
            onChange={(e) =>
              setFilters({
                ...filters,
                to: e.target.value,
              })
            }
            className="bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700"
          />
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => {
              setPage(1);
              setAppliedFilters(filters);
            }}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Apply Filters
          </button>

          <button
            onClick={() => {
              setFilters(initialFilters);
              setAppliedFilters(initialFilters);

              setPage(1);
              setSelectedBatch(null);
            }}
            className="px-5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Activity Table */}

      <ActivityTable loading={activitiesLoading} activities={activities} />

      {/* Pagination */}

      {!activitiesLoading && pagination.pages > 1 && (
        <div className="flex justify-end items-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-slate-300">
            Page {pagination.page} of {pagination.pages}
          </span>

          <button
            disabled={page === pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <BatchOverviewTable
        batches={batchOverview}
        loading={batchLoading}
        selectedBatch={selectedBatch}
        onBatchSelect={setSelectedBatch}
      />
    </div>
  );
}
