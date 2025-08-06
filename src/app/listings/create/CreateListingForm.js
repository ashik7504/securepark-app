'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Our client-side Supabase client
import { useRouter } from 'next/navigation';

// These arrays match the ENUM types we created in our database schema
const spaceTypes = ['covered_garage', 'basement_parking', 'open_driveway', 'gated_open_lot', 'motorcycle_spot'];
const vehicleTypes = ['bicycle', 'motorcycle', 'car', 'suv', 'pickup'];

export default function CreateListingForm({ user }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [spaceType, setSpaceType] = useState(spaceTypes[0]);
  const [allowedVehicles, setAllowedVehicles] = useState([]);
  const [hourlyPrice, setHourlyPrice] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleVehicleTypeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setAllowedVehicles([...allowedVehicles, value]);
    } else {
      setAllowedVehicles(allowedVehicles.filter((v) => v !== value));
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      setError('You can upload a maximum of 10 photos.');
      return;
    }

    setUploading(true);
    setError('');

    const uploadedPhotoUrls = [];
    for (const file of files) {
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('listing-photos') // Our bucket name
        .upload(fileName, file);
      
      if (uploadError) {
        setError(`Error uploading photo: ${uploadError.message}`);
        setUploading(false);
        return;
      }
      
      // Get the public URL for the uploaded photo
      const { data: { publicUrl } } = supabase.storage
        .from('listing-photos')
        .getPublicUrl(fileName);
        
      uploadedPhotoUrls.push(publicUrl);
    }
    
    setPhotos(uploadedPhotoUrls);
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (photos.length === 0) {
      setError('Please upload at least one photo.');
      return;
    }

    const { data, error: insertError } = await supabase.from('listings').insert([
      {
        host_id: user.id,
        title,
        description,
        address_text: address,
        space_type: spaceType,
        allowed_vehicle_types: allowedVehicles,
        price_per_hour: hourlyPrice,
        price_per_day: dailyPrice || null, // Handle optional daily price
        photos: photos,
      },
    ]).select();

    if (insertError) {
      setError(`Error creating listing: ${insertError.message}`);
    } else {
      // Redirect to the new listing's page or a dashboard
      alert('Listing created successfully!');
      router.push('/'); // Redirect to homepage for now
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Column 1 */}
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Listing Title</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="4" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="spaceType" className="block text-sm font-medium text-gray-700">Type of Space</label>
          <select id="spaceType" value={spaceType} onChange={(e) => setSpaceType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            {spaceTypes.map(type => <option key={type} value={type}>{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
          </select>
        </div>
      </div>
      {/* Column 2 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Allowed Vehicle Types</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {vehicleTypes.map(type => (
              <label key={type} className="flex items-center space-x-2">
                <input type="checkbox" value={type} onChange={handleVehicleTypeChange} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500" />
                <span>{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="hourlyPrice" className="block text-sm font-medium text-gray-700">Price per Hour (BDT)</label>
            <input type="number" id="hourlyPrice" value={hourlyPrice} onChange={(e) => setHourlyPrice(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="dailyPrice" className="block text-sm font-medium text-gray-700">Price per Day (BDT)</label>
            <input type="number" id="dailyPrice" value={dailyPrice} onChange={(e) => setDailyPrice(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
        </div>
        <div>
          <label htmlFor="photos" className="block text-sm font-medium text-gray-700">Upload Photos (up to 10)</label>
          <input type="file" id="photos" onChange={handlePhotoUpload} multiple accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
          {uploading && <p className="text-sm text-indigo-600 mt-2">Uploading photos...</p>}
        </div>
      </div>
      {/* Submit Button */}
      <div className="md:col-span-2">
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <button type="submit" disabled={uploading} className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
          {uploading ? 'Processing...' : 'Create Listing'}
        </button>
      </div>
    </form>
  );
}