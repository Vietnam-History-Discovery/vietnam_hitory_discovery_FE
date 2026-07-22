import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { Trash2, Pencil, Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { getUsers, deleteUser, updateUser } from '../../services/userService'
import { useAuth } from '../../context/useAuth'
import ConfirmDialog from '../ui/ConfirmDialog'

const inputClass =
  'w-full bg-surface2 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm'
const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

function RoleBadge({ role }) {
  const isAdmin = role === 'ADMIN'
  return (
    <span
      className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 border ${
        isAdmin
          ? 'text-primary bg-primary/20 border-primary/40'
          : 'text-gray-400 bg-surface2 border-surface2'
      }`}
    >
      {isAdmin ? 'Admin' : 'User'}
    </span>
  )
}

function StatusBadge({ status }) {
  const isActive = status === 'ACTIVE' || !status
  return (
    <span
      className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 border ${
        isActive
          ? 'text-green-400 bg-green-500/10 border-green-500/30'
          : 'text-red-400 bg-red-500/10 border-red-500/30'
      }`}
    >
      {isActive ? 'Hoạt động' : 'Bị khóa'}
    </span>
  )
}

function SortIcon({ direction }) {
  if (direction === 'asc') return <ChevronUp className="w-3 h-3" />
  if (direction === 'desc') return <ChevronDown className="w-3 h-3" />
  return <ChevronsUpDown className="w-3 h-3 opacity-40" />
}

function EditUserModal({ user, isSaving, error, onSave, onCancel }) {
  const [username, setUsername] = useState(user.username || '')
  const [role, setRole] = useState(user.role || 'USER')
  const [status, setStatus] = useState(user.status || 'ACTIVE')
  const [statusReason, setStatusReason] = useState(user.statusReason || '')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      username: username.trim(),
      role,
      status,
      statusReason: status === 'INACTIVE' ? statusReason.trim() : null,
    })
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-md bg-surface border border-surface2 rounded-2xl p-6 shadow-2xl animate-message-in">
        <h2 className="text-lg font-semibold text-gray-100 mb-6">Chỉnh sửa người dùng</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Tên người dùng</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Vai trò</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Trạng thái</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Bị khóa</option>
            </select>
          </div>

          {status === 'INACTIVE' && (
            <div>
              <label className={labelClass}>Lý do khóa</label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                required
                rows={3}
                placeholder="Nhập lý do khóa tài khoản…"
                className={inputClass}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-400 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="text-sm text-gray-400 hover:text-gray-100 transition-colors px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-lg px-4 py-2 text-sm transition-all"
            >
              {isSaving ? 'Đang lưu…' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const columnHelper = createColumnHelper()

export default function UserManagementTab() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [userToDelete, setUserToDelete] = useState(null)
  const [userToEdit, setUserToEdit] = useState(null)
  const [sorting, setSorting] = useState([{ id: 'username', desc: false }])
  const [globalFilter, setGlobalFilter] = useState('')

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getUsers,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setUserToDelete(null)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setUserToEdit(null)
    },
  })

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'Người dùng',
        cell: (info) => {
          const u = info.row.original
          const initial = (u.username || u.email || 'U')[0]?.toUpperCase() || 'U'
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-[10px] font-semibold shrink-0">
                {initial}
              </div>
              <span className="text-sm text-gray-100 truncate">{u.username || 'User'}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => <span className="text-sm text-gray-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor('role', {
        header: 'Vai trò',
        cell: (info) => <RoleBadge role={info.getValue()} />,
      }),
      columnHelper.accessor('status', {
        header: 'Trạng thái',
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: (info) => {
          const u = info.row.original
          const isSelf = u.id === currentUser?.uid
          const isDeleting = deleteMutation.isPending && deleteMutation.variables === u.id
          return (
            <div className="flex justify-end gap-1">
              <button
                onClick={() => setUserToEdit(u)}
                title="Chỉnh sửa"
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1.5 rounded-lg text-gray-600 hover:bg-primary/20 hover:text-primary"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {!isSelf && (
                <button
                  onClick={() => setUserToDelete(u)}
                  disabled={isDeleting}
                  title="Xóa người dùng"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1.5 rounded-lg text-gray-600 hover:bg-red-500/20 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )
        },
      }),
    ],
    [currentUser, deleteMutation.isPending, deleteMutation.variables]
  )

  const table = useReactTable({
    data: users ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const hasNoMatches = !isLoading && !isError && users?.length > 0 && table.getRowModel().rows.length === 0

  return (
    <div className="bg-surface border border-surface2 rounded-xl overflow-hidden">
      {!isLoading && !isError && users.length > 0 && (
        <div className="p-4 border-b border-surface2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Tìm kiếm người dùng…"
              className="w-full bg-surface2 border border-gray-700 rounded-lg pl-9 pr-3.5 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500 py-16 text-center">Đang tải…</p>
      ) : isError ? (
        <p className="text-sm text-gray-500 py-16 text-center">
          Không thể tải danh sách người dùng.
        </p>
      ) : users.length === 0 ? (
        <p className="text-sm text-gray-500 py-16 text-center">Không có người dùng nào</p>
      ) : hasNoMatches ? (
        <p className="text-sm text-gray-500 py-16 text-center">Không tìm thấy người dùng phù hợp</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-surface2">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-4 py-2 text-xs uppercase tracking-wider text-gray-500 font-medium"
                    >
                      {header.column.getCanSort() ? (
                        <button
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1 hover:text-gray-300 transition-colors"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon direction={header.column.getIsSorted()} />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-surface2">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="group hover:bg-surface2/60 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-1.5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!userToDelete}
        title="Xóa người dùng?"
        description={`Xóa "${userToDelete?.username || userToDelete?.email}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(userToDelete.id)}
        onCancel={() => setUserToDelete(null)}
      />

      {userToEdit && (
        <EditUserModal
          user={userToEdit}
          isSaving={updateMutation.isPending}
          error={updateMutation.isError ? (updateMutation.error?.response?.data?.error || 'Không thể lưu thay đổi.') : null}
          onSave={(data) => updateMutation.mutate({ id: userToEdit.id, data })}
          onCancel={() => {
            setUserToEdit(null)
            updateMutation.reset()
          }}
        />
      )}
    </div>
  )
}
