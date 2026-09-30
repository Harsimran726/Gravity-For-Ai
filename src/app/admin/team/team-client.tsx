'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Card } from '@/components/ui/card';
import {
  Users, Plus, Mail, Shield, Eye, Edit3, Trash2, Send, ChevronDown,
  UserCheck, Clock, Crown, X, Check, AlertCircle,
} from 'lucide-react';
import {
  inviteTeamMemberAction,
  updateTeamMemberRoleAction,
  removeTeamMemberAction,
  sendTeamOutreachAction,
} from '@/actions/team-actions';
import type { TeamActionState } from '@/actions/team-actions';

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  title: string | null;
  bio: string | null;
  createdAt: Date;
}

interface Props {
  members: TeamMember[];
  currentUserId: string;
}

const ROLE_LABELS = { ADMIN: 'Admin', EDITOR: 'Editor', VIEWER: 'Viewer' } as const;
const ROLE_ICONS = { ADMIN: Crown, EDITOR: Edit3, VIEWER: Eye } as const;
const ROLE_COLORS = {
  ADMIN: 'bg-[#122C57] text-[#C99A44]',
  EDITOR: 'bg-emerald-700 text-white',
  VIEWER: 'bg-[#374151] text-[#D1D5DB]',
} as const;
const ROLE_DESC = {
  ADMIN: 'Full access: Blogs, Leads, Team, Settings',
  EDITOR: 'Create, edit & delete blogs. View leads.',
  VIEWER: 'Read-only: View leads & bookings only.',
} as const;

function getInitials(name: string | null, email: string) {
  if (name) return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function isPendingInvite(bio: string | null): boolean {
  return !!(bio && bio.includes('STATUS:PENDING'));
}

function StatusBadge({ isPending }: { isPending: boolean }) {
  if (isPending) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px] font-semibold uppercase">
        <Clock className="w-2.5 h-2.5" /> Invite Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-semibold uppercase">
      <UserCheck className="w-2.5 h-2.5" /> Active
    </span>
  );
}

function MemberCard({
  member,
  currentUserId,
  onRoleChange,
  onRemove,
}: {
  member: TeamMember;
  currentUserId: string;
  onRoleChange: (id: string, role: 'ADMIN' | 'EDITOR' | 'VIEWER') => void;
  onRemove: (id: string, name: string) => void;
}) {
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);
  const RoleIcon = ROLE_ICONS[member.role];
  const isSelf = member.id === currentUserId;
  const pending = isPendingInvite(member.bio);

  return (
    <Card variant="outline" className="bg-[#FFFFFF] p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#122C57] flex items-center justify-center text-sm font-mono font-semibold text-[#C99A44] shrink-0">
            {getInitials(member.name, member.email)}
          </div>
          <div>
            <p className="font-sans font-semibold text-sm text-[#122C57]">
              {member.name || '—'}
              {isSelf && <span className="ml-2 text-[10px] font-mono text-[#C99A44] uppercase">(You)</span>}
            </p>
            <p className="text-xs text-[#6B7280] truncate max-w-[180px]">{member.email}</p>
            {member.title && <p className="text-[10px] font-mono text-[#6B7280]">{member.title}</p>}
          </div>
        </div>
        <StatusBadge isPending={pending} />
      </div>

      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold uppercase ${ROLE_COLORS[member.role]}`}>
          <RoleIcon className="w-3 h-3" /> {ROLE_LABELS[member.role]}
        </span>
        <p className="text-[10px] text-[#9CA3AF]">
          Joined {new Date(member.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      <p className="text-[10px] text-[#9CA3AF] leading-relaxed">{ROLE_DESC[member.role]}</p>

      {!isSelf && (
        <div className="pt-3 border-t border-[#E4E2DC] flex items-center justify-between gap-2">
          {/* Role Change */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs text-[#122C57] hover:text-[#C99A44] font-medium transition-colors"
            >
              <Shield className="w-3.5 h-3.5" /> Change Role <ChevronDown className="w-3 h-3" />
            </button>
            {showRoleMenu && (
              <div className="absolute bottom-full mb-1 left-0 w-40 bg-white border border-[#E4E2DC] shadow-lg z-10">
                {(['ADMIN', 'EDITOR', 'VIEWER'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => { onRoleChange(member.id, r); setShowRoleMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-mono hover:bg-[#F7F5F0] transition-colors ${
                      member.role === r ? 'text-[#C99A44] font-semibold bg-[#F7F5F0]' : 'text-[#122C57]'
                    }`}
                  >
                    {member.role === r && <Check className="w-3 h-3 inline mr-1" />} {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Remove */}
          <button
            onClick={() => onRemove(member.id, member.name || member.email)}
            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        </div>
      )}
    </Card>
  );
}

// Submit button that reads pending state from form context (react-dom useFormStatus)
function SubmitButton({ pendingLabel, defaultLabel, className }: { pendingLabel: string; defaultLabel: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : defaultLabel}
    </button>
  );
}

const initialState: TeamActionState = {};

export function TeamManagementClient({ members, currentUserId }: Props) {
  const [inviteState, inviteAction] = useFormState(inviteTeamMemberAction, initialState);
  const [outreachState, outreachAction] = useFormState(sendTeamOutreachAction, initialState);
  const [localMembers, setLocalMembers] = React.useState<TeamMember[]>(members);
  const [showInviteForm, setShowInviteForm] = React.useState(false);
  const [showOutreachForm, setShowOutreachForm] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmRemove, setConfirmRemove] = React.useState<{ id: string; name: string } | null>(null);
  const [removing, setRemoving] = React.useState(false);
  const inviteFormRef = React.useRef<HTMLFormElement>(null);
  const outreachFormRef = React.useRef<HTMLFormElement>(null);

  const showToast = React.useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Handle invite form result
  React.useEffect(() => {
    if (inviteState.success === true) {
      showToast(inviteState.message || 'Invitation sent!', 'success');
      setShowInviteForm(false);
      inviteFormRef.current?.reset();
    } else if (inviteState.success === false && inviteState.message) {
      showToast(inviteState.message, 'error');
    }
  }, [inviteState, showToast]);

  // Handle outreach form result
  React.useEffect(() => {
    if (outreachState.success === true) {
      showToast(outreachState.message || 'Email sent!', 'success');
      setShowOutreachForm(false);
      outreachFormRef.current?.reset();
    } else if (outreachState.success === false && outreachState.message) {
      showToast(outreachState.message, 'error');
    }
  }, [outreachState, showToast]);

  const handleRoleChange = async (id: string, role: 'ADMIN' | 'EDITOR' | 'VIEWER') => {
    const result = await updateTeamMemberRoleAction(id, role);
    if (result.success) {
      setLocalMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
      showToast(result.message || 'Role updated.', 'success');
    } else {
      showToast(result.message || 'Failed to update role.', 'error');
    }
  };

  const handleRemoveConfirm = async () => {
    if (!confirmRemove) return;
    setRemoving(true);
    const result = await removeTeamMemberAction(confirmRemove.id);
    if (result.success) {
      setLocalMembers((prev) => prev.filter((m) => m.id !== confirmRemove.id));
      showToast(result.message || 'Member removed.', 'success');
    } else {
      showToast(result.message || 'Failed to remove member.', 'error');
    }
    setRemoving(false);
    setConfirmRemove(null);
  };

  const adminCount = localMembers.filter((m) => m.role === 'ADMIN').length;
  const editorCount = localMembers.filter((m) => m.role === 'EDITOR').length;
  const viewerCount = localMembers.filter((m) => m.role === 'VIEWER').length;
  const pendingCount = localMembers.filter((m) => isPendingInvite(m.bio)).length;

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Confirm Remove Dialog */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-serif text-xl text-[#122C57]">Remove Team Member</h3>
            <p className="text-sm text-[#6B7280]">
              Are you sure you want to remove <strong>{confirmRemove.name}</strong>? They will immediately lose access to the admin panel.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleRemoveConfirm}
                disabled={removing}
                className="flex-1 bg-red-600 text-white text-sm font-semibold py-2 px-4 hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {removing ? 'Removing...' : 'Yes, Remove Member'}
              </button>
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 bg-[#F7F5F0] text-[#122C57] text-sm font-semibold py-2 px-4 hover:bg-[#E4E2DC] border border-[#E4E2DC] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E2DC]">
        <div>
          <h1 className="font-serif text-3xl text-[#122C57]">Team Management</h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Invite team members, define roles, and broadcast internal communications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowOutreachForm((v) => !v); setShowInviteForm(false); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#122C57] text-[#122C57] text-xs font-semibold hover:bg-[#122C57] hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5" /> Send Outreach
          </button>
          <button
            onClick={() => { setShowInviteForm((v) => !v); setShowOutreachForm(false); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#122C57] text-white text-xs font-semibold hover:bg-[#0A1B3D] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Invite Member
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Members', value: localMembers.length, icon: Users, color: 'text-[#122C57]' },
          { label: 'Admins', value: adminCount, icon: Crown, color: 'text-[#C99A44]' },
          { label: 'Editors', value: editorCount, icon: Edit3, color: 'text-emerald-600' },
          { label: 'Pending Invites', value: pendingCount, icon: Clock, color: 'text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} variant="outline" className="p-4 bg-white space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-mono text-[#6B7280] uppercase">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`font-mono text-2xl font-semibold ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Invite Form Panel */}
      {showInviteForm && (
        <Card variant="outline" className="bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl text-[#122C57] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#C99A44]" /> Invite New Team Member
            </h2>
            <button onClick={() => setShowInviteForm(false)} className="text-[#6B7280] hover:text-[#122C57] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form ref={inviteFormRef} action={inviteAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#6B7280] uppercase">Full Name *</label>
              <input
                name="name"
                required
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57] bg-[#F7F5F0]"
              />
              {inviteState.errors?.name && <p className="text-[11px] text-red-500">{inviteState.errors.name[0]}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#6B7280] uppercase">Email Address *</label>
              <input
                name="email"
                type="email"
                required
                placeholder="priya@company.com"
                className="w-full px-3 py-2 border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57] bg-[#F7F5F0]"
              />
              {inviteState.errors?.email && <p className="text-[11px] text-red-500">{inviteState.errors.email[0]}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#6B7280] uppercase">Role *</label>
              <select
                name="role"
                required
                className="w-full px-3 py-2 border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57] bg-[#F7F5F0]"
              >
                <option value="EDITOR">Editor — Blog CMS + View Leads</option>
                <option value="VIEWER">Viewer — Read-only Leads access</option>
                <option value="ADMIN">Admin — Full access (same as you)</option>
              </select>
              {inviteState.errors?.role && <p className="text-[11px] text-red-500">{inviteState.errors.role[0]}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#6B7280] uppercase">Job Title (optional)</label>
              <input
                name="title"
                placeholder="e.g. Content Manager"
                className="w-full px-3 py-2 border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57] bg-[#F7F5F0]"
              />
            </div>
            <div className="sm:col-span-2 pt-2 flex items-center gap-3">
              <SubmitButton
                pendingLabel="Sending Invite..."
                defaultLabel="Send Invitation Email"
                className="inline-flex items-center gap-2 bg-[#122C57] text-white text-xs font-semibold px-5 py-2.5 hover:bg-[#0A1B3D] disabled:opacity-60 transition-colors"
              />
              <p className="text-[11px] text-[#9CA3AF]">An invitation email with a secure setup link will be sent.</p>
            </div>
          </form>
        </Card>
      )}

      {/* Outreach Email Form Panel */}
      {showOutreachForm && (
        <Card variant="outline" className="bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl text-[#122C57] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#C99A44]" /> Send Team Outreach Email
            </h2>
            <button onClick={() => setShowOutreachForm(false)} className="text-[#6B7280] hover:text-[#122C57] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form ref={outreachFormRef} action={outreachAction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#6B7280] uppercase">Recipients</label>
                <select
                  name="recipients"
                  className="w-full px-3 py-2 border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57] bg-[#F7F5F0]"
                >
                  <option value="ALL">All Team Members ({localMembers.length})</option>
                  <option value="ADMIN">Admins only ({adminCount})</option>
                  <option value="EDITOR">Editors only ({editorCount})</option>
                  <option value="VIEWER">Viewers only ({viewerCount})</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#6B7280] uppercase">Subject *</label>
                <input
                  name="subject"
                  required
                  placeholder="e.g. New Blog Guidelines — Please Read"
                  className="w-full px-3 py-2 border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57] bg-[#F7F5F0]"
                />
                {outreachState.errors?.subject && <p className="text-[11px] text-red-500">{outreachState.errors.subject[0]}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#6B7280] uppercase">Message *</label>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="Write your internal team message here..."
                className="w-full px-3 py-2 border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57] bg-[#F7F5F0] resize-none"
              />
              {outreachState.errors?.message && <p className="text-[11px] text-red-500">{outreachState.errors.message[0]}</p>}
            </div>
            <div className="flex items-center gap-3 pt-1">
              <SubmitButton
                pendingLabel="Sending..."
                defaultLabel="Send to Team"
                className="inline-flex items-center gap-2 bg-[#122C57] text-white text-xs font-semibold px-5 py-2.5 hover:bg-[#0A1B3D] disabled:opacity-60 transition-colors"
              />
              <p className="text-[11px] text-[#9CA3AF]">Emails are sent concurrently to all selected recipients.</p>
            </div>
          </form>
        </Card>
      )}

      {/* Team Members Grid */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl text-[#122C57] flex items-center gap-2">
          <Users className="w-5 h-5 text-[#C99A44]" /> Team Members
          <span className="font-mono text-sm text-[#6B7280] font-normal">({localMembers.length})</span>
        </h2>
        {localMembers.length === 0 ? (
          <Card variant="outline" className="p-8 bg-white border-dashed text-center space-y-2">
            <Users className="w-6 h-6 text-[#C99A44] mx-auto" />
            <p className="text-sm font-medium text-[#122C57]">No Team Members Yet</p>
            <p className="text-xs text-[#6B7280]">Invite your first team member using the button above.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {localMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                currentUserId={currentUserId}
                onRoleChange={handleRoleChange}
                onRemove={(id, name) => setConfirmRemove({ id, name })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Role Reference Guide */}
      <Card variant="outline" className="bg-[#F7F5F0] p-5">
        <h3 className="font-sans font-semibold text-sm text-[#122C57] mb-3">Role Permissions Reference</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              {
                role: 'ADMIN' as const,
                perms: [
                  'Dashboard Overview',
                  'Manage Bookings',
                  'Blog CMS (All)',
                  'All Leads & Inquiries',
                  'Testimonials',
                  'Site Settings',
                  'Security & Audit Log',
                  'Team Management',
                ],
              },
              {
                role: 'EDITOR' as const,
                perms: [
                  'Dashboard Overview',
                  'View Bookings',
                  'Blog CMS (All — Create, Edit, Delete)',
                  'View Leads & Inquiries',
                  'View Testimonials',
                ],
              },
              {
                role: 'VIEWER' as const,
                perms: [
                  'Dashboard Overview',
                  'View Bookings (read-only)',
                  'View Leads & Inquiries (read-only)',
                ],
              },
            ] as const
          ).map(({ role, perms }) => {
            const Icon = ROLE_ICONS[role];
            return (
              <div key={role} className="p-4 bg-white border border-[#E4E2DC] space-y-2">
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono font-semibold uppercase rounded ${ROLE_COLORS[role]}`}
                >
                  <Icon className="w-3 h-3" /> {ROLE_LABELS[role]}
                </div>
                <ul className="space-y-1">
                  {perms.map((p) => (
                    <li key={p} className="text-[11px] text-[#4B5563] flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
