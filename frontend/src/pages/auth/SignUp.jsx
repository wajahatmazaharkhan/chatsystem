import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Briefcase, Mail, Phone, Lock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ROLES, HEAD_HR_TYPES, GROUPS } from "../../utils/constants";
import { handleRegister } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "sub-admin", "head-hr", "group-manager", "sub-group-manager", "student"], {
    message: "Please select a role",
  }),
  headHrType: z.enum(["publishing", "non-publishing"]).optional(),
  assignedGroups: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.role === "head-hr" && !data.headHrType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select a Head HR division",
      path: ["headHrType"],
    });
  }
  if (data.role === "group-manager") {
    if (!data.assignedGroups || data.assignedGroups.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Group Managers must select at least 1 group",
        path: ["assignedGroups"],
      });
    } else if (data.assignedGroups.length > 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Group Managers can select a maximum of 3 groups",
        path: ["assignedGroups"],
      });
    }
  }
});

export default function SignUp() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [createdUserData, setCreatedUserData] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();


  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      assignedGroups: [],
    },
  });

  const selectedRole = watch("role");
  const selectedGroups = watch("assignedGroups") || [];

  const handleGroupToggle = (groupId) => {
    const current = new Set(selectedGroups);
    if (current.has(groupId)) {
      current.delete(groupId);
    } else {
      if (current.size < 3) {
        current.add(groupId);
      }
    }
    setValue("assignedGroups", Array.from(current), { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      const response = await handleRegister(data);
      setCreatedUserData({ email: data.email, role: response.user?.role || data.role });
      setIsSubmitted(true);
    } catch (err) {
      console.error("Registration failed:", err);
      setApiError(err.message || "Failed to register account. Please try again.");
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setApiError(null);
    setCreatedUserData(null);
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 py-10 overflow-x-hidden relative">
      {/* Background Glows */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 blur-3xl rounded-full -top-40 -left-40 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/20 blur-3xl rounded-full -bottom-40 -right-40 pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8 text-white my-8">
        
        {user && (
          <div className="mb-6 p-4 rounded-2xl bg-cyan-900/30 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-cyan-200">
            <div>
              <p className="text-sm font-semibold">Currently signed in as <span className="text-white">{user.name || user.email}</span> ({user.role})</p>
              <p className="text-xs text-gray-300">Need to access your workspace or register a new user?</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/dashboard/analytics")}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-xs transition"
              >
                Go to Dashboard
              </button>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        {isSubmitted ? (

          <div className="text-center py-10 space-y-4">
            <CheckCircle2 size={64} className="text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-3xl font-bold text-white">Registration Complete</h2>
            <p className="text-gray-300 text-lg">
              Account for <strong className="text-cyan-400">{createdUserData?.email}</strong> ({createdUserData?.role}) has been successfully created.
            </p>
            <div className="flex justify-center gap-4 pt-6">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-2xl font-semibold bg-white/10 hover:bg-white/20 border border-white/10 transition"
              >
                Register Another User
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 rounded-2xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:scale-105 transition shadow-lg shadow-cyan-500/20"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-center">Create Account</h1>
            <p className="text-center text-gray-300 text-lg mt-2 mb-8">
              Join the Student Cohort Monitoring System
            </p>

            {apiError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-200">
                <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block mb-2 text-lg font-semibold text-gray-200">Full Name</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <User className="text-indigo-400 mr-3" size={22} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    {...register("fullName")}
                    className="bg-transparent outline-none w-full text-lg placeholder:text-gray-500 text-white"
                  />
                </div>
                {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block mb-2 text-lg font-semibold text-gray-200">Email Address</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <Mail className="text-indigo-400 mr-3" size={22} />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    {...register("email")}
                    className="bg-transparent outline-none w-full text-lg placeholder:text-gray-500 text-white"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone & Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-lg font-semibold text-gray-200">Phone Number</label>
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <Phone className="text-indigo-400 mr-3" size={22} />
                    <input
                      type="tel"
                      placeholder="+1 234 567 8900"
                      {...register("phone")}
                      className="bg-transparent outline-none w-full text-lg placeholder:text-gray-500 text-white"
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block mb-2 text-lg font-semibold text-gray-200">Password</label>
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <Lock className="text-indigo-400 mr-3" size={22} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...register("password")}
                      className="bg-transparent outline-none w-full text-lg placeholder:text-gray-500 text-white"
                    />
                  </div>
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block mb-3 text-lg font-semibold text-gray-200">System Role</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ROLES.map((roleItem) => (
                    <label
                      key={roleItem.id}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer transition-all ${
                        selectedRole === roleItem.id
                          ? "border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/10 text-white font-semibold"
                          : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <input
                        type="radio"
                        value={roleItem.id}
                        {...register("role")}
                        className="hidden"
                      />
                      <Briefcase size={20} className="mb-1 text-indigo-400" />
                      <span className="text-sm text-center">{roleItem.label}</span>
                    </label>
                  ))}
                </div>
                {errors.role && <p className="text-red-400 text-sm mt-1">{errors.role.message}</p>}
              </div>

              {/* Conditional Field: Head HR Type */}
              {selectedRole === "head-hr" && (
                <div className="p-4 rounded-2xl bg-indigo-900/30 border border-indigo-500/30 space-y-3">
                  <label className="block text-md font-bold text-indigo-300">Head HR Operational Division</label>
                  <div className="grid grid-cols-2 gap-3">
                    {HEAD_HR_TYPES.map((type) => (
                      <label
                        key={type.id}
                        className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                          watch("headHrType") === type.id
                            ? "border-indigo-400 bg-indigo-500/30 text-white font-bold"
                            : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        <input
                          type="radio"
                          value={type.id}
                          {...register("headHrType")}
                          className="hidden"
                        />
                        <span>{type.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.headHrType && <p className="text-red-400 text-sm">{errors.headHrType.message}</p>}
                </div>
              )}

              {/* Conditional Field: Group Manager Assignment */}
              {selectedRole === "group-manager" && (
                <div className="p-4 rounded-2xl bg-cyan-900/30 border border-cyan-500/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-md font-bold text-cyan-300">Assign Managed Groups</label>
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      selectedGroups.length >= 1 && selectedGroups.length <= 3
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-red-500/20 text-red-300 border border-red-500/40"
                    }`}>
                      {selectedGroups.length} / 3 Selected
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {GROUPS.map((group) => {
                      const isChecked = selectedGroups.includes(group.id);
                      const isDisabled = !isChecked && selectedGroups.length >= 3;

                      return (
                        <label
                          key={group.id}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                            isChecked
                              ? "border-cyan-400 bg-cyan-500/20 text-white font-medium"
                              : isDisabled
                              ? "opacity-40 cursor-not-allowed border-white/5 bg-white/5"
                              : "border-white/10 bg-white/5 hover:bg-white/10 text-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isDisabled}
                              onChange={() => handleGroupToggle(group.id)}
                              className="accent-cyan-500 w-4 h-4"
                            />
                            <span>{group.name}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            group.type === "publishing"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}>
                            {group.type}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.assignedGroups && <p className="text-red-400 text-sm">{errors.assignedGroups.message}</p>}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl text-xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <span className="animate-spin text-2xl">↻</span>
                ) : (
                  <UserPlus size={24} />
                )}
                {isSubmitting ? "Creating Account..." : "Complete Registration"}
              </button>
            </form>

            {/* Footer / Navigation Link */}
            <div className="border-t border-white/10 my-6" />
            <p className="text-center text-gray-400 text-lg">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-cyan-400 hover:underline">
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
