export default function Footer() {
    return (
        <footer className="bg-cream/50 dark:bg-darkCard border-t border-olive/10 dark:border-gray-800 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-olive/10 dark:bg-darkBg shadow-sm">
                        <img src="/vortex-logo.png" alt="Vortex Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-black text-gray-900 dark:text-cream tracking-tight text-xl">VORTEX</span>
                </div>
                <p className="text-gray-500 dark:text-gray-500 text-sm font-medium">&copy; {new Date().getFullYear()} Vortex Fitness. All rights reserved.</p>
            </div>
        </footer>
    );
}
