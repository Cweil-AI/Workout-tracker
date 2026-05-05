'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/log', label: 'Log Workout' },
  { href: '/history', label: 'History' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <div className="max-w-2xl mx-auto">
        <div className="flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 text-center py-3 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-blue-400 border-t-2 border-blue-400 -mt-px'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
