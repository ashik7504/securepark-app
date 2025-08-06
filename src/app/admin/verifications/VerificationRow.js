// src/app/admin/verifications/VerificationRow.js
'use client';

import { useState } from 'react';
// ❗️ REMOVE the direct import from './actions'

export default function VerificationRow({ request, getSignedDocumentUrls, approveRequest, rejectRequest }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleViewDocuments = async () => {
    setIsLoading(true);
    try {
      const signedUrls = await getSignedDocumentUrls(request.document_urls);
      signedUrls.forEach(item => {
        if (item.signedUrl) window.open(item.signedUrl, '_blank');
      });
    } catch (error) {
      alert(error.message);
    }
    setIsLoading(false);
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await approveRequest(request.id, request.user_id);
    } catch (error) {
      alert(error.message);
    }
    // No need to setIsLoading(false) because the page will refresh
  };

  return (
    <div className="bg-white p-4 border rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
      <div>
        <p className="font-semibold">{request.profiles.full_name}</p>
        <p className="text-sm text-gray-500">{new Date(request.created_at).toLocaleDateString()}</p>
      </div>
      <div className="md:col-span-3 flex flex-wrap items-center justify-end gap-2">
        <button onClick={handleViewDocuments} disabled={isLoading} className="btn-secondary">View Documents</button>
        <form action={rejectRequest}>
          <div className="flex gap-2">
            <input type="hidden" name="requestId" value={request.id} />
            <input type="text" name="reason" placeholder="Rejection reason (optional)" className="input-sm" />
            <button type="submit" disabled={isLoading} className="btn-danger">Reject</button>
          </div>
        </form>
        <button onClick={handleApprove} disabled={isLoading} className="btn-primary">Approve</button>
      </div>
    </div>
  );
}