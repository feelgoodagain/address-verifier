export default function Home() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="card card-pad">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <form className="mt-6 space-y-5">
          <span>
            <a className="mr-4 btn-primary" href="/login">Login</a>
          </span>
          <span>
            <a className="btn-primary" href="/register">Register</a>
          </span>
        </form>
      </div>
    </main>
  );
}