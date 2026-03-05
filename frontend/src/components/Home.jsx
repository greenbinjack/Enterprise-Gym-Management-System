import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
    const { theme } = useTheme();

    return (
        <div className="flex flex-col font-sans bg-cream dark:bg-darkBg transition-colors duration-500 selection:bg-olive selection:text-white dark:selection:bg-lightSage dark:selection:text-darkBg">
            {/* Hero Section */}
            <div className="relative pt-40 pb-20 md:pt-48 lg:pt-56 lg:pb-32 px-4 flex flex-col items-center justify-center text-center overflow-hidden min-h-screen">
                {/* Background decorative blobs */}
                <div className="absolute top-20 -left-20 w-96 h-96 bg-lightSage/40 dark:bg-olive/15 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70 animate-blob"></div>
                <div className="absolute top-40 -right-20 w-96 h-96 bg-olive/30 dark:bg-brown/15 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-brown/20 dark:bg-lightSage/15 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>

                <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
                    <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/80 dark:bg-darkCard/80 backdrop-blur-sm text-olive dark:text-lightSage text-sm font-bold border border-olive/20 dark:border-lightSage/20 mb-8 shadow-sm tracking-wide">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-olive dark:bg-lightSage opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-olive dark:bg-lightSage"></span>
                        </span>
                        Elevate Your Fitness Journey
                    </span>

                    <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tighter mb-8 leading-[1.1]">
                        Strength meets <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive via-brown to-olive dark:from-lightSage dark:via-cream dark:to-lightSage animate-gradient bg-300%">
                            Elegance.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        Experience state-of-the-art facilities, elite personal trainers, and an exclusive community dedicated to your absolute success.
                    </p>

                    {/* Primary Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-gray-900 to-black text-white dark:from-cream dark:to-white dark:text-darkBg font-black rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-2 group"
                        >
                            Start Your Journey
                            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </Link>
                        <Link
                            to="/plans"
                            className="w-full sm:w-auto px-10 py-5 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md text-gray-900 dark:text-cream font-black rounded-2xl shadow-lg border-2 border-transparent hover:border-olive dark:hover:border-lightSage transition-all duration-300 text-lg flex items-center justify-center"
                        >
                            View Memberships
                        </Link>
                    </div>
                </div>
            </div>

            {/* Premium Divider */}
            <div className="w-full max-w-6xl mx-auto px-6">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
            </div>

            {/* About Us Section */}
            <section id="about" className="py-24 px-6 md:px-12 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            {/* Decorative framing for image placeholder */}
                            <div className="absolute -inset-4 bg-gradient-to-tr from-olive to-brown dark:from-lightSage dark:to-olive rounded-3xl opacity-20 dark:opacity-10 blur-xl"></div>
                            <div className="relative h-[500px] w-full bg-white dark:bg-darkCard rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden group">
                                <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop" alt="Premium Facility" className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8">
                                    <span className="text-white font-bold uppercase tracking-widest text-sm mb-2 opacity-90">Premium Facility</span>
                                </div>
                                {/* Diagonal premium shine effect */}
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer pointer-events-none"></div>
                            </div>

                            {/* Floating stat card */}
                            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-darkCard p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
                                <p className="text-4xl font-black text-olive dark:text-lightSage mb-1">50+</p>
                                <p className="text-gray-600 dark:text-gray-400 font-bold text-sm">Elite Trainers</p>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2 space-y-8">
                            <div>
                                <h2 className="text-olive dark:text-lightSage font-bold uppercase tracking-widest text-sm mb-3">About Us</h2>
                                <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-cream leading-tight">
                                    Redefining what a gym <span className="text-olive dark:text-lightSage">should be.</span>
                                </h3>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                Founded in 2024, Vortex isn't just a place to sweat. We are a sanctuary for those who demand excellence in every aspect of their lives. We've combined country-club aesthetics with hardcore training methodologies to create an unparalleled fitness environment.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    'State-of-the-art Italian engineered equipment',
                                    'Eucalyptus infused recovery saunas',
                                    'Limitless organic smoothie bar access',
                                    'Exclusive member networking events'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center text-gray-700 dark:text-gray-300 font-medium text-lg">
                                        <div className="w-8 h-8 rounded-full bg-olive/10 dark:bg-lightSage/10 flex items-center justify-center mr-4 flex-shrink-0">
                                            <svg className="w-5 h-5 text-olive dark:text-lightSage" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="pt-4">
                                <Link to="/about" onClick={() => window.scrollTo(0, 0)} className="text-olive dark:text-lightSage font-bold text-lg hover:underline underline-offset-4 decoration-2">
                                    Discover our facility &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Careers Call to Action */}
            <section className="py-24 px-6 relative z-10 bg-white/50 dark:bg-darkCard/50 backdrop-blur-sm border-t border-b border-lightSage/20 dark:border-gray-800">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-cream">
                        Are you a fitness professional?
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Join the most prestigious team in the industry. We provide our trainers with industry-leading compensation, full benefits, and an elite clientele.
                    </p>
                    <Link
                        to="/careers"
                        className="inline-flex items-center justify-center px-8 py-4 bg-olive text-white dark:bg-lightSage dark:text-darkBg font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg group"
                    >
                        Apply to become a Trainer
                        <svg className="w-5 h-5 ml-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </Link>
                </div>
            </section>
        </div>
    );
}