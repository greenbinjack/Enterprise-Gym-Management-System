export default function Footer() {
    return (
        <footer className="py-12 bg-cream dark:bg-darkBg text-center border-t border-lightSage/30 dark:border-gray-800 transition-colors mt-auto relative z-10 w-full">
            <div className="flex items-center justify-center gap-2 mb-6 opacity-80">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src="/vortex-logo.png" alt="Vortex Logo" className="w-full h-full object-cover" />
                </div>
                <span className="font-black text-gray-900 dark:text-cream tracking-tight text-xl">VORTEX</span>
            </div>
            <p className="text-gray-500 dark:text-gray-500 text-sm font-medium">&copy; {new Date().getFullYear()} Vortex Fitness. All rights reserved.</p>
        </footer>
    );
}
