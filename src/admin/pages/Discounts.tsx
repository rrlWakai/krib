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
  PhilippinePeso,
  Copy,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { discounts as initialDiscounts, villas } from '../data/mockData'
import type { Discount, DiscountType } from '../types'
import { cn } from '../../lib/cn'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

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
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEditModal(discount: Discount) {
    setEditingId(discount.id)
    setForm({
      code: discount.code,
      description: discount.description,
      type: discount.type,
      amount: discount.amount,
      villaId: discount.villaId,
      startDate: discount.startDate,
      endDate: discount.endDate,
    })
    setShowModal(true)
  }

  function handleSave() {
    if (!form.code || !form.description || !form.amount || !form.startDate || !form.endDate) return

    if (editingId) {
      setDiscountList((prev) =>
        prev.map((d) =>
          d.id === editingId
            ? {
                ...d,
                code: form.code.toUpperCase(),
                description: form.description,
                type: form.type,
                amount: Number(form.amount),
                villaId: form.villaId,
                startDate: form.startDate,
                endDate: form.endDate,
              }
            : d
        )
      )
    } else {
      const newDiscount: Discount = {
        id: `disc-${String(discountList.length + 1).padStart(3, '0')}`,
        code: form.code.toUpperCase(),
        description: form.description,
        type: form.type,
        amount: Number(form.amount),
        villaId: form.villaId,
        startDate: form.startDate,
        endDate: form.endDate,
        status: 'active',
        usageCount: 0,
        maxUsage: 50,
      }
      setDiscountList((prev) => [...prev, newDiscount])
    }

    setShowModal(false)
    setForm(emptyForm)
    setEditingId(null)
  }

  function toggleStatus(id: string) {
    setDiscountList((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: d.status === 'active' ? 'inactive' : 'active' }
          : d
      )
    )
  }

  function handleDelete(id: string) {
    setDiscountList((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Discounts"
          subtitle="Manage promotional codes and special offers"
          breadcrumbs={[
            { label: 'Dashboard', path: '/admin' },
            { label: 'Discounts' },
          ]}
          action={
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-[12px] bg-primary px-5 py-2.5 font-body text-body-md font-medium text-on-primary transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
            >
              <Plus size={18} />
              Create Discount
            </button>
          }
        />
      </motion.div>

      <motion.div variants={fadeIn} className="mb-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search discounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-[12px] border border-outline-variant bg-white py-2.5 pl-10 pr-4 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/50 transition-colors focus:border-primary focus:outline-none"
          />
        </div>
      </motion.div>

      <motion.div
        variants={fadeIn}
        className="overflow-hidden rounded-[16px] bg-white shadow-card"
      >
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="px-5 py-4 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Code
                </th>
                <th className="px-5 py-4 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Description
                </th>
                <th className="px-5 py-4 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Type
                </th>
                <th className="px-5 py-4 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Amount
                </th>
                <th className="px-5 py-4 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Villa
                </th>
                <th className="px-5 py-4 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Validity
                </th>
                <th className="px-5 py-4 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Status
                </th>
                <th className="px-5 py-4 text-left font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Usage
                </th>
                <th className="px-5 py-4 text-right font-body text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDiscounts.map((discount, i) => (
                <motion.tr
                  key={discount.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-outline-variant/50 transition-colors hover:bg-surface-container-low"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-body text-body-md font-semibold text-on-surface">
                        {discount.code}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(discount.code)}
                        className="text-on-surface-variant/50 transition-colors hover:text-primary"
                        title="Copy code"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-body text-body-sm text-on-surface-variant line-clamp-1 max-w-[200px]">
                      {discount.description}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      {discount.type === 'percentage' ? (
                        <Percent size={14} className="text-primary" />
                      ) : (
                        <PhilippinePeso size={14} className="text-primary" />
                      )}
                      <span className="font-body text-body-sm capitalize text-on-surface">
                        {discount.type === 'percentage' ? 'Percentage' : 'Fixed'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-body text-body-md font-medium text-on-surface">
                      {discount.type === 'percentage'
                        ? `${discount.amount}%`
                        : `₱${discount.amount.toLocaleString()}`}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-body text-body-sm text-on-surface-variant">
                      {getVillaName(discount.villaId)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-body text-body-sm text-on-surface-variant">
                      {new Date(discount.startDate).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      –{' '}
                      {new Date(discount.endDate).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={discount.status} size="sm" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-body text-body-sm text-on-surface">
                        {discount.usageCount}/{discount.maxUsage}
                      </span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-container-high">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              (discount.usageCount / discount.maxUsage) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(discount.id)}
                        className={cn(
                          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
                          discount.status === 'active' ? 'bg-primary' : 'bg-outline-variant'
                        )}
                        title={discount.status === 'active' ? 'Disable' : 'Enable'}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                            discount.status === 'active'
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          )}
                        />
                      </button>
                      <button
                        onClick={() => openEditModal(discount)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(discount.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredDiscounts.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <Tag size={40} className="mx-auto mb-3 text-outline-variant" />
                    <p className="font-body text-body-md text-on-surface-variant">
                      No discounts found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden p-4 flex flex-col gap-3">
          {filteredDiscounts.map((discount, i) => (
            <motion.div
              key={discount.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-[12px] border border-outline-variant/50 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-on-surface">{discount.code}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(discount.code)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-primary"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <StatusBadge status={discount.status} size="sm" />
              </div>
              <p className="text-sm text-on-surface-variant mb-2 line-clamp-1">{discount.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  {discount.type === 'percentage' ? <Percent size={14} className="text-primary" /> : <PhilippinePeso size={14} className="text-primary" />}
                  <span className="font-medium">{discount.type === 'percentage' ? `${discount.amount}%` : `₱${discount.amount.toLocaleString()}`}</span>
                </div>
                <span className="text-on-surface-variant">{getVillaName(discount.villaId)}</span>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => toggleStatus(discount.id)}
                  className={cn(
                    'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
                    discount.status === 'active' ? 'bg-primary' : 'bg-outline-variant'
                  )}
                  title={discount.status === 'active' ? 'Disable' : 'Enable'}
                >
                  <span
                    className={cn(
                      'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                      discount.status === 'active'
                        ? 'translate-x-[22px]'
                        : 'translate-x-1'
                    )}
                  />
                </button>
                <button
                  onClick={() => openEditModal(discount)}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(discount.id)}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
          {filteredDiscounts.length === 0 && (
            <div className="py-16 text-center">
              <Tag size={40} className="mx-auto mb-3 text-outline-variant" />
              <p className="font-body text-body-md text-on-surface-variant">
                No discounts found
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[20px] bg-white p-6 shadow-card md:static md:rounded-[16px] md:flex md:items-center md:justify-center md:p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-lg rounded-[16px] bg-white p-6 shadow-card md:shadow-none"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-headline-sm text-on-surface">
                    {editingId ? 'Edit Discount' : 'Create Discount'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-body text-body-sm font-medium text-on-surface">
                      Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SUMMER2026"
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                      className="rounded-[12px] border border-outline-variant bg-white px-4 py-2.5 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/50 transition-colors focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-body text-body-sm font-medium text-on-surface">
                      Description
                    </label>
                    <textarea
                      placeholder="Brief description of this discount"
                      rows={2}
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      className="resize-none rounded-[12px] border border-outline-variant bg-white px-4 py-2.5 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/50 transition-colors focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-body-sm font-medium text-on-surface">
                        Type
                      </label>
                      <select
                        value={form.type}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            type: e.target.value as DiscountType,
                          }))
                        }
                        className="rounded-[12px] border border-outline-variant bg-white px-4 py-2.5 font-body text-body-md text-on-surface transition-colors focus:border-primary focus:outline-none"
                      >
                        <option value="fixed">Fixed (₱)</option>
                        <option value="percentage">Percentage (%)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-body-sm font-medium text-on-surface">
                        Amount
                      </label>
                      <input
                        type="number"
                        placeholder={form.type === 'fixed' ? '₱ 0' : '0%'}
                        value={form.amount}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, amount: e.target.value }))
                        }
                        className="rounded-[12px] border border-outline-variant bg-white px-4 py-2.5 font-body text-body-md text-on-surface placeholder:text-on-surface-variant/50 transition-colors focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-body text-body-sm font-medium text-on-surface">
                      Villa
                    </label>
                    <select
                      value={form.villaId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, villaId: e.target.value }))
                      }
                      className="rounded-[12px] border border-outline-variant bg-white px-4 py-2.5 font-body text-body-md text-on-surface transition-colors focus:border-primary focus:outline-none"
                    >
                      <option value="all">All Villas</option>
                      {villas.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-body-sm font-medium text-on-surface">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, startDate: e.target.value }))
                        }
                        className="rounded-[12px] border border-outline-variant bg-white px-4 py-2.5 font-body text-body-md text-on-surface transition-colors focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-body-sm font-medium text-on-surface">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, endDate: e.target.value }))
                        }
                        className="rounded-[12px] border border-outline-variant bg-white px-4 py-2.5 font-body text-body-md text-on-surface transition-colors focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="rounded-[12px] border border-outline-variant bg-white px-5 py-2.5 font-body text-body-md font-medium text-on-surface transition-colors hover:bg-surface-container-low"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="rounded-[12px] bg-primary px-5 py-2.5 font-body text-body-md font-medium text-on-primary transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
                  >
                    {editingId ? 'Save Changes' : 'Create Discount'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
