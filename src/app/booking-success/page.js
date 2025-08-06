import Link from 'next/link';

export default function BookingSuccessPage() {
  return (
    <div className="container mx-auto max-w-lg text-center p-8">
      <div className="bg-white p-12 rounded-lg shadow-lg border">
        <h1 className="text-3xl font-bold text-green-600">Booking Confirmed!</h1>
        <p className="text-gray-700 mt-4">Your parking spot is reserved. Thank you for using SecurePark.</p>
        <Link href="/" className="mt-8 inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700">
            Back to Home
        </Link>
      </div>
    </div>
  );
}