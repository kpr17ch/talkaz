import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <main className="text-center space-y-8">
        <h1 className="text-5xl font-bold text-white">Talkaz</h1>
        <p className="text-xl text-gray-400">Create your own virtual room with AI characters</p>
        <Link
          href="/playground"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg cursor-pointer transition-colors"
        >
          Enter Playground
        </Link>
      </main>
    </div>
  );
}
