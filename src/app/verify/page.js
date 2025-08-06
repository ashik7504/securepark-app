'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to submit a request.');
      setUploading(false);
      return;
    }

    if (files.length === 0) {
      setError('Please select at least one document to upload.');
      setUploading(false);
      return;
    }

    const uploadedUrls = [];
    for (const file of files) {
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('verification-documents') // Upload to the private bucket
        .upload(fileName, file);

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }
      // We store the path, not the public URL, since the bucket is private
      uploadedUrls.push(fileName);
    }

    // Create the verification request record
    const { error: insertError } = await supabase.from('verification_requests').insert({
      user_id: user.id,
      document_urls: uploadedUrls,
      status: 'pending',
    });

    if (insertError) {
      setError(`Could not submit request: ${insertError.message}`);
    } else {
      alert('Verification request submitted successfully!');
      router.push('/dashboard');
    }

    setUploading(false);
  };

  return (
    <div className="container mx-auto max-w-lg p-8">
      <div className="bg-white p-8 rounded-lg shadow-md border">
        <h1 className="text-2xl font-bold mb-2">Become a Verified Host</h1>
        <p className="text-gray-600 mb-6">Upload a document (e.g., National ID, Utility Bill) to verify your identity. Your documents will be kept private and secure.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="documents" className="block text-sm font-medium text-gray-700">Verification Documents</label>
            <input
              type="file"
              id="documents"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {uploading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}