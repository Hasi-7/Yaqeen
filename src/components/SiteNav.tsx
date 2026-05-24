import Link from "next/link";
import { BookOpen, HelpCircle, Home, MessageSquareText } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/ask", label: "Ask", icon: MessageSquareText },
  { href: "/help", label: "Help", icon: HelpCircle },
  { href: "/about", label: "About", icon: BookOpen },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#d9d6ca] bg-[#f7f6f1]/92 backdrop-blur">
      <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold text-[#10221d]">
          Yaqeen
        </Link>
        <div className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-[#405047] transition hover:bg-white hover:text-[#0f766e]"
            >
              <Icon size={16} aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
