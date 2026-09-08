"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Tag, 
  User, 
  Pencil,
  Calendar,
  MessageSquare
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CustomerForm } from "./CustomerForm";
import type { Customer, Job } from "@/domain/entities";

export function CustomerDetailView({ customer, jobs }: { customer: Customer; jobs: Job[] }) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  const completedJobs = jobs.filter(j => j.progress === 100).length;
  const activeJobs = jobs.filter(j => j.progress > 0 && j.progress < 100).length;
  const pendingJobs = jobs.filter(j => j.progress === 0).length;

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/customers"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Customers
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{customer.name}</h1>
              <p className="text-sm text-gray-600">{customer.customerNumber}</p>
            </div>
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Pencil size={16} />
              Edit Customer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-400" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{customer.phone}</p>
                    </div>
                  </div>
                )}
                {customer.whatsapp && (
                  <div className="flex items-center gap-3">
                    <MessageSquare className="text-gray-400" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">WhatsApp</p>
                      <p className="text-sm font-medium text-gray-900">{customer.whatsapp}</p>
                    </div>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                    </div>
                  </div>
                )}
                {(customer.address || customer.city || customer.state) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">
                        {customer.address && <span>{customer.address}<br /></span>}
                        {customer.city && customer.state && `${customer.city}, ${customer.state}`}
                        {customer.city && !customer.state && customer.city}
                        {!customer.city && customer.state && customer.state}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Gender</p>
                  <p className="text-sm font-medium text-gray-900">{customer.gender}</p>
                </div>
                {customer.occupation && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Occupation</p>
                    <p className="text-sm font-medium text-gray-900">{customer.occupation}</p>
                  </div>
                )}
                {customer.preferredStyle && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Preferred Style</p>
                    <p className="text-sm font-medium text-gray-900">{customer.preferredStyle}</p>
                  </div>
                )}
                {customer.preferredFabric && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Preferred Fabric</p>
                    <p className="text-sm font-medium text-gray-900">{customer.preferredFabric}</p>
                  </div>
                )}
                {customer.preferredColours && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Preferred Colors</p>
                    <p className="text-sm font-medium text-gray-900">{customer.preferredColours}</p>
                  </div>
                )}
                {customer.occasion && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Occasion</p>
                    <p className="text-sm font-medium text-gray-900">{customer.occasion}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Measurements */}
            {customer.measurements && Object.keys(customer.measurements).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Measurements</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(customer.measurements).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs text-gray-500 mb-1 capitalize">{key}</p>
                      <p className="text-sm font-medium text-gray-900">{value}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Jobs List */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Jobs History</h2>
              </div>
              <div className="p-6">
                {jobs.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No jobs yet for this customer.</p>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{job.jobNumber}</p>
                            <p className="text-xs text-gray-500">{job.style}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              ₦{job.contractPrice.toLocaleString()}
                            </p>
                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                              job.progress === 100
                                ? "bg-green-100 text-green-700"
                                : job.progress > 0
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {job.progress === 100 ? "Completed" : job.progress > 0 ? "In Progress" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Quick Info */}
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customer Status</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  customer.returning 
                    ? "bg-green-100 text-green-700" 
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {customer.returning ? "Active Member" : "New Customer"}
                </span>
              </div>
            </div>

            {/* Job Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Job Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Jobs</span>
                  <span className="text-lg font-bold text-gray-900">{jobs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium text-green-600">{completedJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-sm font-medium text-blue-600">{activeJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-sm font-medium text-gray-600">{pendingJobs}</span>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {customer.interests && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Interests & Notes</h3>
                <p className="text-sm text-gray-700">{customer.interests}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <Modal onClose={() => setShowEdit(false)} title="Edit Customer">
          <CustomerForm
            referrers={[]}
            initial={customer}
            onDone={() => {
              setShowEdit(false);
              router.refresh();
            }}
            onCancel={() => setShowEdit(false)}
          />
        </Modal>
      )}
    </>
  );
}
