"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, UserRound, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/boards/free", label: "Boards" },
  { href: "/courses", label: "Courses" },
  { href: "/market", label: "Market" },
  { href: "/timetable", label: "Timetable" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link className="brand" href="/" onClick={() => setOpen(false)}>
        <span className="brand-mark">CT</span>
        <span>CampusTalk</span>
      </Link>

      <button
        className="icon-button mobile-menu"
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <nav className={open ? "primary-nav open" : "primary-nav"}>
        {links.map((link) => (
          <Link
            key={link.href}
            className={pathname.startsWith(link.href) ? "active" : ""}
            href={link.href}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <Link className="icon-button" aria-label="Search courses" href="/courses">
          <Search size={18} />
        </Link>
        <Link className="login-link" href="/login">
          <UserRound size={17} />
          <span>Login</span>
        </Link>
      </div>
    </header>
  );
}
