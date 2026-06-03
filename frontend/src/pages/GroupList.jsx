import { useState, useEffect } from "react";

import { getAllGroups, getMyGroup } from "../services/groupService";

import Loader from "../components/ui/Loader";

import GroupMembersTable from "../components/group/GroupMembersTable";

export default function GroupList() {
  const user = JSON.parse(
  localStorage.getItem("user")
);

const role = user?.role?.toUpperCase();

  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
  try {

    if (role === "ADMIN") {

      const res = await getAllGroups();

      setGroups(res.data.groups);

    } else if (role === "MANAGER") {

      const res = await getMyGroup();

      setGroups([res.data]); 

    }

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
        Groups
      </h1>

      <GroupMembersTable groups={groups} />
    </div>
  );
}