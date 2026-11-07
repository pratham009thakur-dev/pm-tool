import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { addMemberApi, removeMemberApi } from '../services/projectService';
import AddMemberModal from '../components/forms/AddMemberModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { Users, UserPlus, Trash2, Shield } from 'lucide-react';

const TeamPage = () => {
  const { projectId } = useParams();
  const { currentProject, selectProject, setCurrentProject } = useProject();
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [removeUserId, setRemoveUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await selectProject(projectId);
      setLoading(false);
    };
    init();
  }, [projectId]);

  const handleAddMember = async (userId, role) => {
    const updated = await addMemberApi(projectId, { userId, role });
    setCurrentProject(updated);
  };

  const handleRemoveMember = async () => {
    if (!removeUserId) return;
    const updated = await removeMemberApi(projectId, removeUserId);
    setCurrentProject(updated);
    setRemoveUserId(null);
  };

  if (loading || !currentProject) return <Spinner size="lg" className="h-64" />;

  const isOwner = currentProject.owner?._id === user?._id || currentProject.owner === user?._id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Collaboration Team</h1>
          <p className="text-xs text-slate-500">Authorized engineers and access roles for this project</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add Team Member
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Member Name</th>
              <th className="px-6 py-3.5">Email</th>
              <th className="px-6 py-3.5">Assigned Role</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentProject.members?.map((m) => {
              const memberObj = m.user;
              const isMemberOwner = currentProject.owner?._id === memberObj?._id;

              return (
                <tr key={memberObj?._id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs">
                      {memberObj?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="font-bold text-slate-800">{memberObj?.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{memberObj?.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center text-xs font-semibold text-slate-700">
                      <Shield className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                      {m.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isOwner && !isMemberOwner && (
                      <button
                        onClick={() => setRemoveUserId(memberObj?._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddMember={handleAddMember}
        currentMembers={currentProject.members || []}
      />

      <ConfirmDialog
        isOpen={!!removeUserId}
        onClose={() => setRemoveUserId(null)}
        onConfirm={handleRemoveMember}
        title="Remove Member from Project?"
        message="This user will lose access to all task boards, Gantt charts, and discussions for this project."
      />
    </div>
  );
};

export default TeamPage;