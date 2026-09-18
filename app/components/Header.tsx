export default function Header() {
  return (
    <header className="border-b border-purple-800/60">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="font-bold text-lg tracking-wide">
          ინვესტორი
        </a>
        <nav className="flex gap-6 text-sm text-purple-200">
          <a href="/" className="hover:text-white">
            მთავარი
          </a>
          <a href="/stocks" className="hover:text-white">
            სტოკები
          </a>
          <a href="/news" className="hover:text-white">
            სიახლეები
          </a>
        </nav>
      </div>
    </header>
  );
}