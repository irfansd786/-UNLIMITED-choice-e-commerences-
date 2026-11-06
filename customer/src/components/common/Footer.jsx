import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-cream-200 border-t border-forest-900 py-7 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 text-xs">
          
          {/* Left: Copyright */}
          <div className="text-cream-400 text-center md:text-left text-[11px] tracking-wide order-3 md:order-1">
            © {new Date().getFullYear()} UNLIMITED choice. All Rights Reserved.
          </div>

          {/* Middle: Horizontal Links Side-by-Side */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-6 gap-y-2 text-cream-300 font-medium text-xs order-1 md:order-2">
            <Link 
              to="/privacy-policy" 
              className="hover:text-gold-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-forest-800 hidden sm:inline">•</span>
            <Link 
              to="/terms" 
              className="hover:text-gold-300 transition-colors"
            >
              Terms & Conditions
            </Link>
            <span className="text-forest-800 hidden sm:inline">•</span>
            <Link 
              to="/return-policy" 
              className="hover:text-gold-300 transition-colors"
            >
              Return & Exchange Policy
            </Link>
            <span className="text-forest-800 hidden sm:inline">•</span>
            <Link 
              to="/faq" 
              className="hover:text-gold-300 transition-colors"
            >
              Help & FAQs
            </Link>
          </nav>

          {/* Right: Social Icons (No links, just icons) */}
          <div className="flex items-center gap-3.5 text-cream-300 order-2 md:order-3">
            <span 
              className="w-8 h-8 rounded-full bg-forest-900/80 border border-forest-800/80 flex items-center justify-center hover:text-gold-300 transition-colors cursor-default"
              title="Facebook"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </span>
            <span 
              className="w-8 h-8 rounded-full bg-forest-900/80 border border-forest-800/80 flex items-center justify-center hover:text-gold-300 transition-colors cursor-default"
              title="Instagram"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </span>
            <span 
              className="w-8 h-8 rounded-full bg-forest-900/80 border border-forest-800/80 flex items-center justify-center hover:text-gold-300 transition-colors cursor-default"
              title="X"
              aria-label="X"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
