/**
 * @module features/users/pages
 * @description User Management Page — Admin Only CRUD & School Integration for 3 Stakeholder Roles
 * @api GET /api/users, POST /api/users, PUT /api/users/:id, PUT /api/users/:id/status, DELETE /api/users/:id
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, UserPlus, Search, Shield, Filter, CheckCircle2, XCircle,
  Trash2, Mail, ChevronLeft, ChevronRight, Edit, School, Lock, RefreshCw
} from 'lucide-react';
import { apiClient } from '../../../shared/services/api-client';
import ThreeDotsLoader from '../../../shared/components/ThreeDotsLoader';
import ConfirmationModal from '../../../shared/components/ConfirmationModal';
import NotificationManagerModal from '../../notifikasi/components/NotificationManagerModal';

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  // Form state (used for Add and Edit)
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'pengawas' | 'sekolah'>('sekolah');
  const [sekolahId, setSekolahId] = useState<number | ''>('');
  const [instansi, setInstansi] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Sekolah options for dropdown
  const [sekolahOptions, setSekolahOptions] = useState<any[]>([]);

  useEffect(() => {
    apiClient.sekolah.getOptions()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setSekolahOptions(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch users with pagination
  const { data, isLoading, isError, error: fetchError } = useQuery({
    queryKey: ['usersList', roleFilter, search, page, limit],
    queryFn: () => apiClient.users.getAll({ page, limit, role: roleFilter || undefined, search: search || undefined }),
  });

  const usersList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  const totalItems = data?.total || usersList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => apiClient.users.toggleStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
      setUserToDelete(null);
    },
  });

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setNama('');
    setEmail('');
    setPassword('');
    setRole('sekolah');
    setSekolahId('');
    setInstansi('');
    setJabatan('');
    setFormError('');
    setFormSuccess('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (u: any) => {
    setEditingUser(u);
    setNama(u.nama || '');
    setEmail(u.email || '');
    setPassword(''); // Leave blank unless user wants to change it
    setRole(u.role || 'sekolah');
    setSekolahId(u.sekolah_id || '');
    setInstansi(u.instansi || '');
    setJabatan(u.jabatan || '');
    setFormError('');
    setFormSuccess('');
    setIsAddModalOpen(true);
  };

  // Submit Add or Edit User
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const payload: any = {
        nama,
        email,
        password: password || undefined,
        role,
        instansi,
        jabatan,
        sekolah_id: role === 'sekolah' ? sekolahId : null
      };

      if (editingUser) {
        // Update existing user
        const res = await apiClient.users.update(editingUser.id, payload);
        if (res.success) {
          setFormSuccess('Data user & integrasi sekolah berhasil diperbarui!');
          setTimeout(() => {
            setIsAddModalOpen(false);
            setEditingUser(null);
            setFormSuccess('');
            queryClient.invalidateQueries({ queryKey: ['usersList'] });
          }, 1000);
        }
      } else {
        // Create new user
        const res = await apiClient.users.create(payload);
        if (res.success) {
          setFormSuccess('User baru berhasil ditambahkan!');
          setTimeout(() => {
            setIsAddModalOpen(false);
            setFormSuccess('');
            queryClient.invalidateQueries({ queryKey: ['usersList'] });
          }, 1000);
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan data user.');
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'admin': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-200">Admin</span>;
      case 'pengawas': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-200">Pengawas</span>;
      case 'sekolah': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-200">Sekolah</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 border border-slate-200">{r}</span>;
    }
  };

  const getPageRange = () => {
    const range: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-soft">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold font-display text-text-primary">Manajemen User System</h1>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Kelola pengguna sistem untuk 3 Stakeholder (Admin, Pengawas Sekolah, dan Perwakilan Sekolah). Total: <strong>{totalItems}</strong> akun terdaftar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsNotifModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold shadow-md shadow-accent/20 transition-all cursor-pointer"
          >
            <Mail className="h-4 w-4" />
            <span>Bikin & Broadcast Notifikasi</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Tambah User Baru</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama, email, atau sekolah..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-xs text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-1.5 text-xs text-text-secondary">
            <span>Tampilkan:</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="rounded-xl border border-border bg-surface px-2.5 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value={10}>10 Data</option>
              <option value={25}>25 Data</option>
              <option value={50}>50 Data</option>
              <option value={100}>100 Data</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <Filter className="h-4 w-4 text-text-secondary" />
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">Semua Stakeholder</option>
              <option value="admin">Admin System</option>
              <option value="pengawas">Pengawas Sekolah</option>
              <option value="sekolah">Perwakilan Sekolah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface border border-border shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <ThreeDotsLoader text="Memuat daftar pengguna..." />
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-status-belum space-y-2">
            <XCircle className="h-10 w-10 mx-auto opacity-60" />
            <p className="font-bold text-sm">Gagal mengambil daftar user</p>
            <p className="text-xs text-text-secondary">{(fetchError as any)?.message || 'Pastikan Anda login sebagai Admin.'}</p>
          </div>
        ) : usersList.length === 0 ? (
          <div className="p-12 text-center text-text-secondary space-y-2">
            <Users className="h-10 w-10 mx-auto text-text-secondary/40" />
            <p className="font-semibold text-sm">Tidak ada user ditemukan.</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg/80 border-b border-border text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Pengguna</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Instansi / Sekolah Terintegrasi</th>
                    <th className="py-3.5 px-4">Jabatan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usersList.map((u: any) => (
                    <tr key={u.id} className="hover:bg-bg/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {u.nama.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary">{u.nama}</p>
                            <p className="text-[10px] text-text-secondary">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.sekolah_nama ? (
                          <div className="flex items-center space-x-1.5 text-primary font-bold">
                            <School className="h-3.5 w-3.5 shrink-0" />
                            <span>{u.sekolah_nama}</span>
                            {u.sekolah_npsn && <span className="text-[10px] text-text-secondary font-mono">({u.sekolah_npsn})</span>}
                          </div>
                        ) : (
                          <span className="font-medium text-text-secondary">
                            {u.instansi || '-'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary">
                        {u.jabatan || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleMutation.mutate({ id: u.id, isActive: !u.is_active })}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            u.is_active
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 border border-rose-200 hover:bg-rose-500/20'
                          }`}
                        >
                          {u.is_active ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all cursor-pointer"
                          title="Edit User & Integrasi Sekolah"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                          title="Hapus User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-bg/40">
              <p className="text-[11px] text-text-secondary font-medium">
                Menampilkan {Math.min((page - 1) * limit + 1, totalItems)} - {Math.min(page * limit, totalItems)} dari {totalItems} pengguna
              </p>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-bg disabled:opacity-30 transition-smooth cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPageRange().map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition-smooth cursor-pointer ${
                      page === p ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:bg-bg'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-bg disabled:opacity-30 transition-smooth cursor-pointer"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface rounded-2xl p-6 shadow-2xl border border-border space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold font-display text-text-primary text-base flex items-center space-x-2">
                {editingUser ? <Edit className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
                <span>{editingUser ? 'Edit User & Integrasi Sekolah' : 'Tambah User Stakeholder Baru'}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase">Nama Lengkap User</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap User"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg p-2.5 text-xs text-text-primary mt-1 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase">Email Login</label>
                <input
                  type="email"
                  required
                  placeholder="user@survasi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg p-2.5 text-xs text-text-primary mt-1 focus:border-primary focus:outline-none"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Kata Sandi</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg p-2.5 text-xs text-text-primary mt-1 focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase">Role Stakeholder</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-bg p-2.5 text-xs font-bold text-text-primary mt-1 focus:border-primary focus:outline-none"
                >
                  <option value="sekolah">Sekolah (Perwakilan Satuan Pendidikan)</option>
                  <option value="pengawas">Pengawas (Pengawas Sekolah / Penilik)</option>
                  <option value="admin">Admin (Akses Penuh Management & Analisis)</option>
                </select>
              </div>

              {role === 'sekolah' && (
                <div>
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Integrasi Sekolah Pilihan</label>
                  <select
                    value={sekolahId}
                    onChange={(e) => setSekolahId(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-border bg-bg p-2.5 text-xs text-text-primary mt-1 focus:border-primary focus:outline-none font-medium"
                  >
                    <option value="">-- Pilih Sekolah --</option>
                    {sekolahOptions.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama} (NPSN: {s.npsn})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase">Instansi / Organisasi</label>
                <input
                  type="text"
                  placeholder="Contoh: Dinas Pendidikan Sidoarjo"
                  value={instansi}
                  onChange={(e) => setInstansi(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg p-2.5 text-xs text-text-primary mt-1 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-secondary uppercase">Jabatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengawas Pembina / Operator"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg p-2.5 text-xs text-text-primary mt-1 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-text-secondary hover:bg-bg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 cursor-pointer"
                >
                  {editingUser ? 'Perbarui User' : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete User */}
      <ConfirmationModal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => {
          if (userToDelete) {
            deleteMutation.mutate(userToDelete.id);
          }
        }}
        title="Hapus Akun Pengguna"
        description={`Apakah Anda yakin ingin menghapus user ${userToDelete?.nama || ''} (${userToDelete?.email || ''})? Menghapus akun ini juga akan secara otomatis memutuskan integrasi dengan sekolah terkait.`}
        confirmLabel="Ya, Hapus Akun"
        cancelLabel="Batal"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* Broadcast Notification Modal Component */}
      <NotificationManagerModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />
    </div>
  );
}
