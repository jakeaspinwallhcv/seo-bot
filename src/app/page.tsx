export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">AI SEO Platform</h1>
        <p className="text-xl text-muted-foreground">
          Track your rankings in traditional search engines and AI search platforms
        </p>
        <div className="mt-8 space-y-2">
          <p className="text-sm">Phase 1 MVP - Project Setup Complete</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            <li>Next.js 14 with App Router</li>
            <li>TypeScript</li>
            <li>Tailwind CSS</li>
            <li>Project structure established</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
