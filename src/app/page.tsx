export default function Home() {
  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-3">Lawpath Address Verifier</h1>
      <p className="mb-4">Please login to use Address Verifier</p>
      <div className="space-x-3">
        <a className="underline" href="/login">Login</a>
        <a className="underline" href="/register">Register</a>
      </div>
    </main>
  );
}