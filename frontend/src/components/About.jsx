import { Link } from 'react-router-dom';

export default function About() {

    return (
        <div className="min-h-screen bg-cream dark:bg-darkBg transition-colors pt-32 pb-12 px-4 sm:px-6 lg:px-12 relative overflow-hidden flex flex-col">
            {/* Background decorative blobs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-olive/10 dark:bg-lightSage/5 rounded-full filter blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-brown/10 dark:bg-olive/10 rounded-full filter blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto w-full relative z-10 flex-grow flex flex-col">
                {/* Header Controls Removed */}

                {/* Hero Section */}
                <div className="text-center mb-24">
                    <div className="inline-flex py-1.5 px-4 rounded-full bg-white/80 dark:bg-darkCard/80 backdrop-blur-sm text-olive dark:text-lightSage text-sm font-bold border border-olive/20 dark:border-lightSage/20 mb-8 shadow-sm tracking-widest uppercase">
                        Our Story
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-cream tracking-tighter mb-8 leading-[1.1]">
                        Redefining what a gym <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive via-brown to-olive dark:from-lightSage dark:via-cream dark:to-lightSage animate-gradient bg-300%">
                            should be.
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
                        Founded in 2024, Vortex isn't just a place to sweat. We are a sanctuary for those who demand excellence in every aspect of their lives.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                    {[
                        { icon: "🏛️", title: "Premium Facility", desc: "State-of-the-art Italian engineered equipment spanning over 50,000 square feet." },
                        { icon: "🧘‍♂️", title: "Luxury Recovery", desc: "Eucalyptus infused saunas, cold plunges, and dedicated massage therapy wings." },
                        { icon: "🤝", title: "Elite Community", desc: "Networking events, private lounges, and a limitless organic smoothie bar." },
                        { icon: "🎓", title: "World-Class Trainers", desc: "Every trainer holds advanced degrees and elite certifications in human performance." },
                        { icon: "💻", title: "Smart Integration", desc: "Track every workout, meal, and biometric marker perfectly through our bespoke platform." },
                        { icon: "🌍", title: "Holistic Approach", desc: "We believe fitness is just one pillar of a truly transformed, excellent life." }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white/80 dark:bg-darkCard/80 backdrop-blur-md p-10 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 transition-all hover:-translate-y-2 hover:shadow-2xl group">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-darkBg rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-cream mb-4">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Gallery Section */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-cream tracking-tighter mb-4">Our Facility</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">Take a look inside the premier fitness sanctuary.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg group">
                            <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop" alt="Gym weights" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                        <div className="h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg group lg:col-span-2">
                            <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop" alt="Gym training area" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                        <div className="h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg group lg:col-span-2">
                            <img src="https://images.unsplash.com/photo-1593079831268-3381b0c1239b?q=80&w=1469&auto=format&fit=crop" alt="Cardio equipment" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                        <div className="h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg group">
                            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" alt="Recovery room" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                    </div>
                </div>

                {/* Call To Action */}
                <div className="bg-gradient-to-br from-olive to-brown dark:from-darkCard dark:to-darkBg text-white rounded-[3rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden mb-12">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

                    <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10 text-white dark:text-cream">Ready to elevate your standards?</h2>
                    <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto relative z-10 text-white/90 dark:text-gray-300">
                        Join the waiting list or secure your membership today to lock in your spot among the elite.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
                        <Link to="/register" className="px-10 py-5 bg-white text-olive dark:bg-lightSage dark:text-darkBg font-black rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all text-lg">
                            Start Journey
                        </Link>
                        <Link to="/plans" className="px-10 py-5 bg-transparent text-white font-black rounded-2xl border-2 border-white/30 hover:bg-white/10 transition-all text-lg backdrop-blur-sm">
                            View Plans
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
