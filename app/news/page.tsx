export default function NewsPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-4">სიახლეები</h1>
      <p className="text-purple-100 leading-relaxed mb-8">
        აქ გამოჩნდება მოკლე ამბები ბაზარზე, კომპანიებსა და ჩელენჯებზე.
      </p>
      <div className="rounded-xl border border-purple-800/70 bg-purple-950/40 p-6 text-purple-200">
        პოსტები მალე დაემატება
      </div>
    </main>
  );
}