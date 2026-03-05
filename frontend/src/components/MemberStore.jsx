import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function MemberStore() {
    const [plans, setPlans] = useState([]);
    const [ownedPlanIds, setOwnedPlanIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingPlanId, setProcessingPlanId] = useState(null);
    const [billingCycle, setBillingCycle] = useState('monthly');

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchStoreData = async () => {
            setIsLoading(true);
            try {
                const plansRes = await api.get(`/api/subscriptions/plans/${currentUser.id}`);
                setPlans(plansRes.data || []);

                const subRes = await api.get(`/api/subscriptions/status/${currentUser.id}`);
                const activeIds = subRes.data
                    .filter(sub => sub.status === 'ACTIVE' || sub.status === 'GRACE_PERIOD')
                    .map(sub => sub.planId);
                setOwnedPlanIds(activeIds);
            } catch (error) {
                console.error('Failed to load store data', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser?.id) fetchStoreData();
    }, [currentUser?.id]);

    const handleBuy = async (planId, cycle) => {
        setIsProcessing(true);
        setProcessingPlanId(planId);
        try {
            const res = await api.post('/api/subscriptions/initiate-payment', {
                userId: currentUser.id,
                planId,
                billingCycle: cycle,
                creditCardToken: 'SSLCOMMERZ_REDIRECT',
            });
            if (res.data.gatewayUrl) {
                window.location.href = res.data.gatewayUrl;
            } else {
                alert('Failed to get payment gateway URL.');
                setIsProcessing(false);
                setProcessingPlanId(null);
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Could not connect to payment gateway.');
            setIsProcessing(false);
            setProcessingPlanId(null);
        }
    };

    const getYearlyPrice = (plan) => {
        if (plan.yearlyPrice && plan.yearlyPrice > 0) return plan.yearlyPrice;
        return plan.monthlyPrice * 12 * 0.85;
    };

    const basePackages = plans.filter(p => p.category === 'BASE_MEMBERSHIP').sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    const classPackages = plans.filter(p => p.category === 'CLASS_PACKAGE').sort((a, b) => a.monthlyPrice - b.monthlyPrice);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full overflow-y-auto w-full">
            {/* Header */}
            <div className="text-center mb-14">
                <span className="text-olive dark:text-lightSage font-bold uppercase tracking-widest text-sm mb-4 block">Membership Store</span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-cream tracking-tighter mb-4">
                    Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive to-brown dark:from-lightSage dark:to-cream">Journey.</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                    Select the perfect plan to match your fitness ambitions. All memberships include full-facility access.
                </p>

                {/* Billing Toggle */}
                <div className="flex justify-center items-center space-x-4 mt-8">
                    <span className={`text-sm tracking-widest uppercase transition-colors ${billingCycle === 'monthly' ? 'font-black text-gray-900 dark:text-cream' : 'text-gray-400 dark:text-gray-500 font-bold'}`}>
                        Monthly
                    </span>
                    <button
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className="relative w-16 h-8 bg-gray-200 dark:bg-gray-800 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive dark:focus:ring-offset-darkBg shadow-inner"
                    >
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-olive dark:bg-lightSage rounded-full transition-transform duration-300 shadow-md ${billingCycle === 'yearly' ? 'translate-x-8' : ''}`}></div>
                    </button>
                    <span className={`text-sm tracking-widest uppercase flex items-center gap-2 transition-colors ${billingCycle === 'yearly' ? 'font-black text-gray-900 dark:text-cream' : 'text-gray-400 dark:text-gray-500 font-bold'}`}>
                        Yearly <span className="text-[10px] bg-olive/10 dark:bg-lightSage/20 text-olive dark:text-lightSage border border-olive/20 dark:border-lightSage/30 px-2.5 py-1 rounded-full animate-pulse">Save 15%</span>
                    </span>
                </div>
            </div>

            <div className="space-y-20">
                {/* Base Packages */}
                {basePackages.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-cream text-center mb-10 uppercase tracking-tight">
                            Base <span className="text-olive dark:text-lightSage">Packages</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {basePackages.map(plan => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    billingCycle={billingCycle}
                                    isOwned={ownedPlanIds.includes(plan.id)}
                                    isProcessing={isProcessing && processingPlanId === plan.id}
                                    onBuy={handleBuy}
                                    getYearlyPrice={getYearlyPrice}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Divider */}
                {basePackages.length > 0 && classPackages.length > 0 && (
                    <div className="w-full max-w-lg mx-auto h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
                )}

                {/* Class Packages */}
                {classPackages.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-cream text-center mb-10 uppercase tracking-tight">
                            Class <span className="text-olive dark:text-lightSage">Packages</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {classPackages.map(plan => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    billingCycle={billingCycle}
                                    isOwned={ownedPlanIds.includes(plan.id)}
                                    isProcessing={isProcessing && processingPlanId === plan.id}
                                    onBuy={handleBuy}
                                    getYearlyPrice={getYearlyPrice}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {basePackages.length === 0 && classPackages.length === 0 && (
                    <div className="text-center py-24 text-gray-400 dark:text-gray-500">
                        <span className="text-5xl block mb-4">🛒</span>
                        <p className="text-xl font-black text-gray-700 dark:text-cream">No plans available yet.</p>
                        <p className="text-sm mt-2">Check back later for new offerings.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function PlanCard({ plan, billingCycle, isOwned, isProcessing, onBuy, getYearlyPrice }) {
    const isPremium = plan.category === 'BASE_MEMBERSHIP' && plan.monthlyPrice > 35;
    const priceDisplay = billingCycle === 'monthly' ? plan.monthlyPrice : getYearlyPrice(plan);

    return (
        <div className={`relative bg-white dark:bg-darkCard rounded-[2rem] shadow-xl flex flex-col p-8 transition-all duration-300
            ${isPremium
                ? 'border-2 border-olive dark:border-lightSage transform md:-translate-y-4 shadow-olive/10 z-10'
                : 'border border-gray-100 dark:border-gray-800 hover:-translate-y-2 hover:shadow-2xl'
            }`}
        >
            {isPremium && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-olive to-brown text-white dark:from-lightSage dark:to-olive dark:text-darkBg text-xs font-black uppercase tracking-widest py-1.5 px-6 rounded-full shadow-lg">
                        Most Popular
                    </span>
                </div>
            )}

            {isOwned && (
                <div className="absolute top-4 right-4 bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Active
                </div>
            )}

            <h3 className="text-2xl font-black text-gray-900 dark:text-cream mb-3">{plan.name}</h3>

            <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                    ৳{priceDisplay?.toLocaleString()}
                </span>
                <span className="text-gray-400 dark:text-gray-500 font-bold ml-2 text-sm">/ {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-gray-200 via-gray-300 to-transparent dark:from-gray-800 dark:via-gray-700 mb-6" />

            <ul className="space-y-4 flex-1 mb-8">
                {plan.category === 'BASE_MEMBERSHIP' ? (
                    isPremium ? (
                        <>
                            <FeatureItem title="Elite Facility Access" sub="Unrestricted 24/7 gym floor entry across all locations" />
                            <FeatureItem title="Dedicated Personal Trainer" sub="2 complimentary PT sessions per month" />
                            <FeatureItem title="Nutrition & Diet Plan" sub="Monthly personalized macro & diet tracking" highlight />
                            <FeatureItem title="Premium Amenities" sub="Towel service, private lockers & luxury showers" highlight />
                            <FeatureItem title="VIP Recovery Lounge" sub="Sauna, ice bath & massage therapy access" highlight />
                        </>
                    ) : (
                        <>
                            <FeatureItem title="Standard Facility Access" sub="24/7 gym floor entry at home location" />
                            <FeatureItem title="Cardio & Weights Area" sub="Full access to general training zones" />
                            <FeatureItem title="Community Support" sub="Free app tracking and standard community features" />
                        </>
                    )
                ) : (
                    <>
                        <FeatureItem title={`Class Capacity: ${plan.allocatedSeats || 'N/A'}`} sub="Limited spots available" />
                        <FeatureItem
                            title="Schedule"
                            sub={`Every ${plan.recurringDayOfWeek
                                ? plan.recurringDayOfWeek.split(',').map(d =>
                                    d.trim().charAt(0) + d.trim().slice(1).toLowerCase()).join(', ')
                                : 'TBD'}`}
                        />
                        <FeatureItem title="Time" sub={`${plan.recurringStartTime || 'TBD'} (${plan.durationMinutes || 60} mins)`} />
                        {plan.description && <FeatureItem title="About" sub={plan.description} />}
                    </>
                )}
            </ul>

            {/* Buttons */}
            <div className="space-y-3">
                <button
                    onClick={() => onBuy(plan.id, 'MONTHLY')}
                    disabled={isProcessing || isOwned}
                    className={`w-full font-bold py-3 px-4 rounded-xl shadow-sm transition-all focus:outline-none flex items-center justify-center gap-2
                        ${isOwned
                            ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed'
                            : isPremium
                                ? 'bg-olive hover:bg-olive/90 text-white dark:bg-lightSage dark:text-darkBg dark:hover:bg-lightSage/90 hover:scale-[1.02]'
                                : 'bg-gray-900 text-white hover:bg-black dark:bg-gray-800 dark:text-cream dark:hover:bg-gray-700 hover:scale-[1.02]'
                        }`}
                >
                    {isOwned ? '✓ Currently Active' : isProcessing ? 'Connecting...' : 'Pay Monthly'}
                </button>

                {!isOwned && (
                    <button
                        onClick={() => onBuy(plan.id, 'YEARLY')}
                        disabled={isProcessing}
                        className="w-full bg-white dark:bg-darkCard border-2 border-olive dark:border-lightSage text-olive dark:text-lightSage hover:bg-olive hover:text-white dark:hover:bg-lightSage dark:hover:text-darkBg disabled:opacity-50 font-bold py-2.5 rounded-xl transition-all text-sm"
                    >
                        Pay Yearly — ৳{getYearlyPrice(plan)?.toLocaleString()}
                    </button>
                )}
            </div>
        </div>
    );
}

function FeatureItem({ title, sub, highlight }) {
    return (
        <li className={`flex items-start ${highlight ? 'text-olive dark:text-lightSage font-bold' : 'text-gray-700 dark:text-gray-300 font-medium'} text-sm`}>
            <div className="w-5 h-5 rounded-full bg-olive/10 dark:bg-lightSage/10 text-olive dark:text-lightSage flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <span>
                <strong className="block text-gray-900 dark:text-white">{title}</strong>
                {sub && <span className="opacity-70 font-normal">{sub}</span>}
            </span>
        </li>
    );
}