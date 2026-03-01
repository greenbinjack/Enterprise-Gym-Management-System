import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function MemberStore() {
    const [activeTab, setActiveTab] = useState('BASE_MEMBERSHIP');
    const [plans, setPlans] = useState([]);
    const [ownedPlanIds, setOwnedPlanIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    // FETCH PLANS AND ACTIVE STATUSES
    useEffect(() => {
        const fetchStoreData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch all available plans for this user's tier
                const plansRes = await api.get(`/api/subscriptions/plans/${currentUser.id}`);
                setPlans(plansRes.data);

                // 2. Fetch active subscriptions to prevent duplicate purchases
                const subRes = await api.get(`/api/subscriptions/status/${currentUser.id}`);
                const activeIds = subRes.data
                    .filter(sub => sub.status === 'ACTIVE' || sub.status === 'GRACE_PERIOD')
                    .map(sub => sub.planId);

                setOwnedPlanIds(activeIds);
            } catch (error) {
                console.error("Failed to load store data", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser?.id) fetchStoreData();
    }, [currentUser?.id]);

    // INITIATE SSLCOMMERZ PAYMENT
    const handleBuy = async (planId, cycle) => {
        setIsProcessing(true);
        try {
            const res = await api.post('/api/subscriptions/initiate-payment', {
                userId: currentUser.id,
                planId: planId,
                billingCycle: cycle,
                creditCardToken: "SSLCOMMERZ_REDIRECT" // Placeholder, SSL handles the real card
            });

            // Redirect the user to the SSLCommerz Gateway URL returned by Spring Boot
            if (res.data.gatewayUrl) {
                window.location.href = res.data.gatewayUrl;
            } else {
                alert("Failed to get payment gateway URL.");
                setIsProcessing(false);
            }
        } catch (error) {
            console.error("Payment initiation failed", error);
            alert(error.response?.data?.error || "Could not connect to payment gateway.");
            setIsProcessing(false);
        }
    };

    const displayedPlans = plans.filter(p => p.category === activeTab);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full overflow-y-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-cream tracking-tight mb-2">
                    Membership <span className="text-olive dark:text-lightSage">& Packages</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Choose a base gym access plan, or purchase guaranteed spots in specialized class programs.</p>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex flex-col sm:flex-row gap-2 mb-10 bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl w-full sm:w-fit border border-gray-200 dark:border-gray-700/50">
                <button
                    onClick={() => setActiveTab('BASE_MEMBERSHIP')}
                    className={`px-6 py-3 md:py-2.5 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${activeTab === 'BASE_MEMBERSHIP'
                            ? 'bg-white dark:bg-darkCard text-olive dark:text-lightSage shadow-sm border border-gray-200 dark:border-gray-700'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                        }`}
                >
                    <span className="mr-2">🏢</span> General Gym Access
                </button>
                <button
                    onClick={() => setActiveTab('CLASS_PACKAGE')}
                    className={`px-6 py-3 md:py-2.5 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${activeTab === 'CLASS_PACKAGE'
                            ? 'bg-white dark:bg-darkCard text-olive dark:text-lightSage shadow-sm border border-gray-200 dark:border-gray-700'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                        }`}
                >
                    <span className="mr-2">🧘‍♀️</span> Specialty Class Packages
                </button>
            </div>

            {/* PLAN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedPlans.length === 0 && (
                    <div className="col-span-full p-16 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-darkCard rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 shadow-sm">
                        <span className="text-5xl block mb-4 opacity-50">🛒</span>
                        <p className="text-xl font-black mb-2 text-gray-900 dark:text-cream mt-2">No plans available.</p>
                        <p className="text-sm font-medium">Check back later for new offerings in this category.</p>
                    </div>
                )}

                {displayedPlans.map(plan => {
                    const isOwned = ownedPlanIds.includes(plan.id);

                    return (
                        <div key={plan.id} className="bg-white dark:bg-darkCard rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 hover:border-olive/30 dark:hover:border-lightSage/30 overflow-hidden flex flex-col transition-all group duration-300 transform hover:-translate-y-1 relative">
                            {isOwned && (
                                <div className="absolute top-4 right-4 bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm z-10">
                                    Active
                                </div>
                            )}

                            <div className="p-8 bg-gray-900 dark:bg-black/40 text-white text-center relative overflow-hidden">
                                {/* Decorative background element */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-olive/20 dark:bg-lightSage/20 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-olive/20 dark:bg-lightSage/20 rounded-full blur-2xl"></div>

                                <h3 className="text-2xl font-black mb-3 relative z-10">{plan.name}</h3>
                                <div className="text-4xl font-extrabold text-olive dark:text-lightSage relative z-10">
                                    ৳{plan.monthlyPrice} <span className="text-sm font-bold text-gray-400 dark:text-gray-500 tracking-wider">/ mo</span>
                                </div>
                            </div>

                            <div className="p-8 flex-1 bg-white dark:bg-transparent">
                                <ul className="space-y-4 mb-2">
                                    <li className="flex items-start text-gray-700 dark:text-gray-300">
                                        <div className="w-5 h-5 rounded-full bg-olive/10 dark:bg-lightSage/10 text-olive dark:text-lightSage flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <span className="font-medium text-sm leading-tight mt-0.5">{plan.classLimitPerMonth === 999 ? 'Unlimited Classes per month' : `${plan.classLimitPerMonth} Classes per month`}</span>
                                    </li>
                                    <li className="flex items-start text-gray-700 dark:text-gray-300">
                                        <div className="w-5 h-5 rounded-full bg-olive/10 dark:bg-lightSage/10 text-olive dark:text-lightSage flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <span className="font-medium text-sm leading-tight mt-0.5">{plan.ptSessionsPerMonth} Personal Training Sessions</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-6 bg-gray-50/50 dark:bg-darkBg/50 border-t border-gray-100 dark:border-gray-800 space-y-3 mt-auto">
                                <button
                                    onClick={() => handleBuy(plan.id, 'MONTHLY')}
                                    disabled={isProcessing || isOwned}
                                    className={`w-full font-bold py-3 px-4 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-olive dark:focus:ring-offset-darkBg flex items-center justify-center gap-2
                                        ${isOwned
                                            ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed border-transparent'
                                            : 'bg-olive hover:bg-olive/90 text-white dark:bg-lightSage dark:text-darkBg dark:hover:bg-lightSage/90 hover:shadow-md hover:scale-[1.02]'
                                        }`}
                                >
                                    {isOwned ? (
                                        <><span>✓</span> Currently Active</>
                                    ) : (
                                        isProcessing ? 'Connecting...' : 'Pay Monthly'
                                    )}
                                </button>

                                {plan.category === 'BASE_MEMBERSHIP' && !isOwned && (
                                    <button
                                        onClick={() => handleBuy(plan.id, 'YEARLY')}
                                        disabled={isProcessing}
                                        className="w-full bg-white dark:bg-darkCard border-2 border-olive dark:border-lightSage text-olive dark:text-lightSage hover:bg-olive hover:text-white dark:hover:bg-lightSage dark:hover:text-darkBg disabled:border-gray-300 disabled:text-gray-400 dark:disabled:border-gray-700 dark:disabled:text-gray-600 font-bold py-2.5 rounded-xl shadow-sm transition-all text-sm"
                                    >
                                        Pay Yearly (৳{plan.yearlyPrice})
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}