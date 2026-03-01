export default function Footer() {
    return (
        <footer className="py-12 bg-cream dark:bg-darkBg text-center border-t border-lightSage/30 dark:border-gray-800 transition-colors mt-auto relative z-10 w-full">
            <div className="flex items-center justify-center gap-2 mb-6 opacity-80">
                <div className="w-6 h-6 rounded bg-olive dark:bg-lightSage flex items-center justify-center text-white dark:text-darkBg font-black text-xs">E</div>
                <span className="font-black text-gray-900 dark:text-cream tracking-tight">ENTERPRISE<span className="text-olive dark:text-lightSage">GYM</span></span>
            </div>
            <p className="text-gray-500 dark:text-gray-500 text-sm font-medium">&copy; {new Date().getFullYear()} Enterprise Gym. All rights reserved.</p>
        </footer>
    );
}
