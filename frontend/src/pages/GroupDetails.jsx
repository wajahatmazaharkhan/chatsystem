import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getGroupById } from "../services/groupService";
import Loader from "../components/ui/Loader";
import AssignManagerModal from "../components/group/AssignManagerModal";

export default function GroupDetails() {
  const { id } = useParams();

  const [group, setGroup] = useState();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchGroup();
  }, []);

  async function fetchGroup() {
    try {
      const res = await getGroupById(id);

      setGroup(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loader />;
  }

  if (!group) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-2">Access Forbidden / Group Not Found</h2>
          <p>You do not have permission to access this group or it does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold">
        {group.name}
      </h1>

      <div className="grid grid-cols-3 gap-6 my-8">
        <div className="bg-slate-700 p-6 rounded-xl">
          Members

          <h2 className="text-3xl font-bold">
            {group.members.length}
          </h2>
        </div>

        <div className="bg-slate-700 p-6 rounded-xl">
          Manager

          <p>
            {group.manager_name || group.manager_id || "Not Assigned"}
          </p>
        </div>
      </div>

      <div className="bg-slate-700 rounded-xl p-6">
        <h2 className="font-bold mb-4">
          Students
        </h2>

        {group.member_details ? group.member_details.map((member) => (
          <div
            key={member._id}
            className="py-2 border-b"
          >
            {member.name}
          </div>
        )) : group.members.map((member) => (
          <div
            key={member}
            className="py-2 border-b"
          >
            {member}
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="mt-8 bg-blue-700 text-white px-6 py-3 rounded-lg"
      >
        Assign Manager
      </button>

      {showModal && (
        <AssignManagerModal
          groupId={group._id}
          closeModal={() =>
            setShowModal(false)
          }
        />
      )}
    </div>
  );
}