// import { useState, useEffect } from "react";

// import { assignManager } from "../../services/batchService";
// import { getUsers } from "../../services/userService";

// export default function AssignManagerModal({ groupId, closeModal }) {
//   const [manager, setManager] = useState("");
//   const [managers, setManagers] = useState([]);

//   useEffect(() => {
//     fetchManagers();
//   }, []);

//   const fetchManagers = async () => {
//     try {
//       const data = await getUsers();

//       const users = data.items || [];

//       const managerUsers = users.filter((user) => {
//         return user.role === "MANAGER";
//       });

//       setManagers(managerUsers);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   async function submit() {
//     if (!manager) {
//       alert("Please select a manager");
//       return;
//     }

//     try {
//       await assignManager(groupId, manager);

//       closeModal();
//       window.location.reload();
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   return (
//     <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
//       <div className="bg-slate-800 w-[400px] rounded-xl p-6">
//         <h2 className="text-2xl font-bold mb-4 text-white">Assign Manager</h2>

//         <select
//           value={manager}
//           onChange={(e) => {
//             setManager(e.target.value);
//           }}
//           className="w-full border p-3 rounded-lg text-black"
//         >
//           <option value="">Select Manager</option>

//           {managers.map((mgr) => (
//             <option key={mgr.user_id} value={mgr.user_id}>
//               {mgr.name}
//             </option>
//           ))}
//         </select>

//         <div className="flex gap-4 mt-6">
//           <button
//             onClick={submit}
//             className="bg-blue-700 text-white px-6 py-3 rounded-lg"
//           >
//             Save
//           </button>

//           <button onClick={closeModal} className="text-white">
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";

import { assignManager } from "../../services/batchService";
import { getUsers } from "../../services/userService";

export default function AssignManagerModal({ groupId, closeModal }) {
  const [manager, setManager] = useState("");
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const data = await getUsers();

      const users = data.items || [];

      const managerUsers = users.filter((user) => {
        return user.role === "MANAGER";
      });

      setManagers(managerUsers);
    } catch (err) {
      console.log(err);
    }
  };

  async function submit() {
    if (!manager) {
      alert("Please select a manager");
      return;
    }

    try {
      await assignManager(groupId, manager);

      closeModal();
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-slate-800 w-[400px] rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Assign Manager</h2>

        <select
          value={manager}
          onChange={(e) => {
            setManager(e.target.value);
          }}
          className="w-full border p-3 rounded-lg text-black"
        >
          <option value="">Select Manager</option>

          {managers.map((mgr) => (
            <option key={mgr.user_id} value={mgr.user_id}>
              {mgr.name}
            </option>
          ))}
        </select>

        <div className="flex gap-4 mt-6">
          <button
            onClick={submit}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Save
          </button>

          <button onClick={closeModal} className="text-white">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}