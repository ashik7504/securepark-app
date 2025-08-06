import Link from 'next/link';
import { toggleListingStatus } from '@/app/dashboard/actions';

export default function HostListingRow({ listing }) {
  // Create a specific action for this row using .bind()
  const toggleStatusAction = toggleListingStatus.bind(null, listing.id, listing.is_active);

  return (
    <div className="bg-white p-4 border rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <p className="font-semibold text-gray-800">{listing.title}</p>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          listing.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {listing.is_active ? 'Active' : 'Paused'}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <form action={toggleStatusAction}>
          <button
            type="submit"
            className={`text-sm font-medium px-4 py-2 rounded-md ${
              listing.is_active
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {listing.is_active ? 'Pause' : 'Resume'}
          </button>
        </form>
        <Link
          href={`/listings/${listing.id}/edit`}
          className="text-sm font-medium px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}