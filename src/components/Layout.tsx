import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileSpreadsheet, Image as ImageIcon, Home } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path ? 'text-primary' : 'text-gray-400 hover:text-white';
    };

    return (
        <div className="flex flex-col min-h-screen bg-neutral-950 text-white font-sans selection:bg-primary/30">
            <nav className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        <span className="text-primary">Tex</span>ify.io
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link to="/" className={`flex items-center gap-2 transition-colors ${isActive('/')}`}>
                            <Home size={18} />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <Link to="/image-to-latex" className={`flex items-center gap-2 transition-colors ${isActive('/image-to-latex')}`}>
                            <ImageIcon size={18} />
                            <span className="hidden sm:inline">Image to LaTeX</span>
                        </Link>
                        <Link to="/excel-to-latex" className={`flex items-center gap-2 transition-colors ${isActive('/excel-to-latex')}`}>
                            <FileSpreadsheet size={18} />
                            <span className="hidden sm:inline">Excel to LaTeX</span>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>

            <footer className="border-t border-neutral-800 bg-neutral-900 py-8 mt-auto">
                <div className="container mx-auto px-4 text-center text-neutral-400 text-sm">
                    <div className="flex justify-center gap-6 mb-4">
                        <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link to="#" className="hover:text-primary transition-colors">Help Center</Link>
                    </div>
                    <p>© 2026 Texify.io. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
