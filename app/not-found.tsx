export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Link Not Found</h2>
        <p className="text-gray-400 mb-8">
          The link you are looking for does not exist or has been removed.
        </p>
        <a
          href="/"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Go to homepage
        </a>
      </div>
    </div>
  );
}





