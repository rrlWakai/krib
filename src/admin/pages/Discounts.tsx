import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Tag,
  Pencil,
  Trash2,
  X,
  Search,
  Percent,
  Copy,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { discounts as initialDiscounts, villas } from '../data/mockData'
import type { Discount, DiscountType } from '../types'
import { cn } from '../../lib/cn'

interface DiscountFormData {
  code: string
  description: string
  type: DiscountType
  amount: number | string
  villaId: string
  startDate: string
  endDate: string
}

const emptyForm: DiscountFormData = {
  code: '',
  description: '',
  type: 'fixed',
  amount: '',
  villaId: 'all',
  startDate: '',
  endDate: '',
}

export default function Discounts() {
  const [discountList, setDiscountList] = useState<Discount[]>(initialDiscounts)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DiscountFormData>(emptyForm)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDiscounts = discountList.filter(
    (d) =>
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function getVillaName(villaId: string) {
    if (villaId === 'all') return 'All Villas'
    return villas.find((v) => v.id === villaId)?.name ?? villaId
  }

  function openCreateModal() {
    setEditingId(null); setForm(emptyForm); setShowModal(true)
  }

  function openEditModal(discount: Discount) {
    setEditingId(discount.id)
    setForm({
      code: discount.code, description: discount.description, type: discount.type,
      amount: discount.amount, villaId: discount.villaId,
      startDate: discount.startDate, endDate: discount.endDate,
    })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.code || !form.description || !form.amount || !form.startDate || !form.endDate) return
    if (editingId) {
      setDiscountList((prev) =>
        prev.map((d) => d.id === editingId ? { ...d, code: form.code.toUpperCase(), description: form.description, type: form.type, amount: Number(form.amount), villaId: form.villaId, startDate: form.startDate, endDate: form.endDate } : d)
      )
    } else {
      setDiscountList((prev) => [...prev, {
        id: `disc-${String(prev.length + 1).padStart(3, '0')}`,
        code: form.code.toUpperCase(), description: form.description, type: form.type,
        amount: Number(form.amount), villaId: form.villaId,
        startDate: form.startDate, endDate: form.endDate,
        status: 'active', usageCount: 0, maxUsage: 50,
      }])
    }
    setShowModal(false); setForm(emptyForm); setEditingId(null)
  }

  function toggleStatus(id: string) {
    setDiscountList((prev) => prev.map((d) => d.id === id ? { ...d, status: d.status === 'active' ? 'inactive' : 'active' } : d))
  }

  function handleDelete(id: string) {
    setDiscountList((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Discounts"
        subtitle="Promotional codes and special offers"
        action={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg border border-[#0A1F44] px-4 py-2 font-body text-[13px] font-medium text-[#0A1F44] transition-all hover:bg-[#f0f2f7]"
          >
            <Plus size={16} /> Create Discount
          </button>
        }
      />

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
          <input
            type="text"
            placeholder="Search discounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#ECECEC] bg-white py-2.5 pl-9 pr-4 font-body text-[13px] text-[#0A1F44] placeholder:text-[#757575] transition-colors focus:border-[#0A1F44] outline-none"
          />
        </div>
      </div>

      <div className="border border-[#ECECEC] rounded-lg bg-white overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-[#ECECEC]">
                <th className="px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Code</th>
                <th className="px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Description</th>
                <th className="px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Type</th>
                <th className="px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Amount</th>
                <th className="px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Villa</th>
                <th className="px-5 py-3.5 text-left font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-body text-[11px] uppercase tracking-[0.08em] text-[#757575] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDiscounts.map((discount, i) => (
                <tr key={discount.id} className="border-b border-[#ECECEC]/50 transition-colors hover:bg-[#f0f2f7]/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-body text-[14px] font-medium text-[#0A1F44]">{discount.code}</span>
                      <button onClick={() => navigator.clipboard.writeText(discount.code)} className="text-[#757575] transition-colors hover:text-[#0A1F44]">
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-body text-[12px] text-[#757575] line-clamp-1 max-w-[200px]">{discount.description}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {discount.type === 'percentage' ? <Percent size={13} className="text-[#757575]" /> : <span className="text-[13px] text-[#757575]">₱</span>}
                      <span className="font-body text-[12px] capitalize text-[#0A1F44]">{discount.type === 'percentage' ? 'Percentage' : 'Fixed'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-body text-[14px] font-medium text-[#0A1F44]">
                      {discount.type === 'percentage' ? `${discount.amount}%` : `₱${discount.amount.toLocaleString()}`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-body text-[12px] text-[#757575]">{getVillaName(discount.villaId)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={discount.status} size="sm" />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleStatus(discount.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f0f2f7] hover:text-[#0A1F44]">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => openEditModal(discount)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f0f2f7] hover:text-[#0A1F44]">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(discount.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f0f2f7] hover:text-[#757575]">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDiscounts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Tag size={32} className="text-[#ECECEC]" />
                      <p className="font-body text-[14px] text-[#757575]">No discounts found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden p-4 flex flex-col gap-2">
          {filteredDiscounts.map((discount) => (
            <div key={discount.id} className="rounded-lg border border-[#ECECEC] bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-body text-[14px] font-medium text-[#0A1F44]">{discount.code}</span>
                  <button onClick={() => navigator.clipboard.writeText(discount.code)} className="text-[#757575] hover:text-[#0A1F44]"><Copy size={13} /></button>
                </div>
                <StatusBadge status={discount.status} size="sm" />
              </div>
              <p className="font-body text-[12px] text-[#757575] mb-2 line-clamp-1">{discount.description}</p>
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-[#0A1F44]">{discount.type === 'percentage' ? `${discount.amount}%` : `₱${discount.amount.toLocaleString()}`}</span>
                <span className="text-[#757575]">{getVillaName(discount.villaId)}</span>
              </div>
              <div className="mt-3 flex items-center justify-end gap-1 border-t border-[#ECECEC] pt-3">
                <button onClick={() => toggleStatus(discount.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#757575] hover:bg-[#f0f2f7]"><Pencil size={14} /></button>
                <button onClick={() => openEditModal(discount)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#757575] hover:bg-[#f0f2f7]"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(discount.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#757575] hover:bg-[#f0f2f7]"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {filteredDiscounts.length === 0 && (
            <div className="py-12 text-center">
              <Tag size={32} className="mx-auto mb-2 text-[#ECECEC]" />
              <p className="font-body text-[14px] text-[#757575]">No discounts found</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl bg-white p-6 md:static md:flex md:items-center md:justify-center md:p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-lg rounded-xl bg-white p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-[20px] font-medium text-[#0A1F44]">
                    {editingId ? 'Edit Discount' : 'Create Discount'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#757575] hover:bg-[#f0f2f7]">
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-1 block font-body text-[12px] font-medium text-[#0A1F44]">Code</label>
                    <input type="text" placeholder="e.g. SUMMER2026" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                      className="w-full rounded-lg border border-[#ECECEC] px-4 py-2.5 font-body text-[13px] text-[#0A1F44] placeholder:text-[#757575] outline-none focus:border-[#0A1F44]" />
                  </div>
                  <div>
                    <label className="mb-1 block font-body text-[12px] font-medium text-[#0A1F44]">Description</label>
                    <textarea placeholder="Brief description" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      className="w-full resize-none rounded-lg border border-[#ECECEC] px-4 py-2.5 font-body text-[13px] text-[#0A1F44] placeholder:text-[#757575] outline-none focus:border-[#0A1F44]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block font-body text-[12px] font-medium text-[#0A1F44]">Type</label>
                      <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as DiscountType }))}
                        className="w-full rounded-lg border border-[#ECECEC] px-4 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none focus:border-[#0A1F44]">
                        <option value="fixed">Fixed (₱)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block font-body text-[12px] font-medium text-[#0A1F44]">Amount</label>
                      <input type="number" placeholder={form.type === 'fixed' ? '₱ 0' : '0%'} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                        className="w-full rounded-lg border border-[#ECECEC] px-4 py-2.5 font-body text-[13px] text-[#0A1F44] placeholder:text-[#757575] outline-none focus:border-[#0A1F44]" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block font-body text-[12px] font-medium text-[#0A1F44]">Villa</label>
                    <select value={form.villaId} onChange={(e) => setForm((f) => ({ ...f, villaId: e.target.value }))}
                      className="w-full rounded-lg border border-[#ECECEC] px-4 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none focus:border-[#0A1F44]">
                      <option value="all">All Villas</option>
                      {villas.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block font-body text-[12px] font-medium text-[#0A1F44]">Start Date</label>
                      <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                        className="w-full rounded-lg border border-[#ECECEC] px-4 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none focus:border-[#0A1F44]" />
                    </div>
                    <div>
                      <label className="mb-1 block font-body text-[12px] font-medium text-[#0A1F44]">End Date</label>
                      <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                        className="w-full rounded-lg border border-[#ECECEC] px-4 py-2.5 font-body text-[13px] text-[#0A1F44] outline-none focus:border-[#0A1F44]" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setShowModal(false)}
                    className="rounded-lg border border-[#ECECEC] px-5 py-2.5 font-body text-[13px] text-[#0A1F44] transition-colors hover:bg-[#f0f2f7]">Cancel</button>
                  <button onClick={handleSave}
                    className="rounded-lg bg-[#0A1F44] px-5 py-2.5 font-body text-[13px] font-medium text-white transition-all hover:bg-[#0A1F44]/90">Save</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
