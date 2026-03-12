import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Plans() {
    const navigate = useNavigate();
    const [gymPlans, setGymPlans] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPlanId, setLoadingPlanId] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await api.get('/api/membership-plans');
                setGymPlans(response.data.filter(plan => plan.isActive));
            } catch (error) {
                console.error("Failed to load plans", error);
            } finally {
                setIsFetching(false);
            }
        };
        fetchPlans();
    }, []);

    const handleSelectPlan = async (plan) => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            alert("Please log in to purchase a membership.");
            navigate('/login');
            return;
        }

        const user = JSON.parse(storedUser);

        try {
            const profileRes = await api.get(`/api/member/profile/${user.id}`);
            if (!profileRes.data.isProfileComplete) {
                alert("You must upload a photo and add your phone number before you can purchase plans or scan into the gym.");
                navigate('/member/profile');
                return;
            }
        } catch (error) {
            console.error("Failed to verify profile completeness", error);
            alert("Could not verify your profile. Please try again.");
            return;
        }

        const cycle = billingCycle === 'monthly' ? 'MONTHLY' : 'YEARLY';
        const price = billingCycle === 'monthly' ? plan.monthlyPrice : getYearlyPrice(plan);

        setIsLoading(true);
        setLoadingPlanId(plan.id);

        try {
            const response = await api.post('/api/subscriptions/initiate-payment', {
                userId: user.id,
                planId: plan.id,
                amount: price,
                planName: `${plan.name} (${billingCycle})`,
                billingCycle: cycle
            });

            if (response.data?.gatewayUrl) {
                window.location.href = response.data.gatewayUrl;
            }
        } catch (error) {
            console.error(error);
            alert("Payment setup failed. Please try again.");
            setIsLoading(false);
            setLoadingPlanId(null);
        }
    };

    const getYearlyPrice = (plan) => {
        if (plan.yearlyPrice && plan.yearlyPrice > 0) return plan.yearlyPrice;
        return Math.round(plan.monthlyPrice * 12 * 0.85);
    };

    const getYearlySavingPercent = (plan) => {
        const yearly = getYearlyPrice(plan);
        return Math.round((1 - yearly / (plan.monthlyPrice * 12)) * 100);
    };

    const basePackages = gymPlans.filter(p => p.category === 'BASE_MEMBERSHIP').sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    const classwisePackages = gymPlans.filter(p => p.category === 'CLASS_PACKAGE').sort((a, b) => a.monthlyPrice - b.monthlyPrice);

    return (
        <div className="min-h-screen bg-cream dark:bg-darkBg transition-colors pt-32 pb-20 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
            <div className="absolute top-0 -left-40 w-96 h-96 bg-lightSage/20 dark:bg-olive/5 rounded-full filter blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 -right-40 w-96 h-96 bg-brown/10 dark:bg-lightSage/5 rounded-full filter blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-olive dark:text-lightSage font-bold uppercase tracking-widest text-sm mb-4 block">
                        Membership Options
                    </span>
                    <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-cream tracking-tighter mb-6">
                        Choose Your{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive to-brown dark:from-lightSage dark:to-cream">
                            Journey.
                        </span>
                    </h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Select the perfect tier to match your fitness ambitions. All memberships include full-facility 24/7 access.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center mt-10 p-1.5 rounded-full bg-white dark:bg-darkCard shadow-md border border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-wider transition-all duration-300 ${
                                billingCycle === 'monthly'
                                    ? 'bg-gray-900 dark:bg-cream text-white dark:text-darkBg shadow-sm'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                                billingCycle === 'yearly'
                                    ? 'bg-gray-900 dark:bg-cream text-white dark:text-darkBg shadow-sm'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            Yearly
                            <span className="text-[10px] bg-olive/20 text-olive dark:bg-lightSage/20 dark:text-lightSage px-2 py-0.5 rounded-full font-black">
                                Save More
                            </span>
                        </button>
                    </div>
                </div>

                {isFetching ? (
                    <div className="flex justify-center h-64 items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage" />
                    </div>
                ) : (
                    <div className="space-y-24">
                        {basePackages.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-cream text-center mb-12 uppercase tracking-tight">
                                    Base <span className="text-olive dark:text-lightSage">Packages</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
                                    {basePackages.map(plan => (
                                        <PlanCard
                                            key={plan.id}
                                            plan={plan}
                                            billingCycle={billingCycle}
                                            isLoading={isLoading && loadingPlanId === plan.id}
                                            onSelect={handleSelectPlan}
                                            getYearlyPrice={getYearlyPrice}
                                            getYearlySavingPercent={getYearlySavingPercent}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {classwisePackages.length > 0 && (
                            <div>
                                {basePackages.length > 0 && (
                                    <div className="w-full max-w-lg mx-auto h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mb-20" />
                                )}
                                <h3 className="text-2xl font-black text-gray-900 dark:text-cream text-center mb-12 uppercase tracking-tight">
                                    Class <span className="text-olive dark:text-lightSage">Packages</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
                                    {classwisePackages.map(plan => (
                                        <PlanCard
                                            key={plan.id}
                                            plan={plan}
                                            billingCycle={billingCycle}
                                            isLoading={isLoading && loadingPlanId === plan.id}
                                            onSelect={handleSelectPlan}
                                            getYearlyPrice={getYearlyPrice}
                                            getYearlySavingPercent={getYearlySavingPercent}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function PlanCard({ plan, billingCycle, isLoading, onSelect, getYearlyPrice, getYearlySavingPercent }) {
    const isPremium = plan.category === 'BASE_MEMBERSHIP' && plan.monthlyPrice > 5000;
    const isYearly = billingCycle === 'yearly';
    const priceDisplay = isYearly ? getYearlyPrice(plan) : plan.monthlyPrice;
    const savingPercent = getYearlySavingPercent(plan);

    return (
        <div className={`relative bg-white dark:bg-darkCard rounded-[2rem] shadow-xl flex flex-col p-8 transition-all duration-300
            ${isPremium
                ? 'border-2 border-olive dark:border-lightSage md:-translate-y-4 shadow-olive/10 z-10'
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

            {/* Plan name */}
            <h3 className="text-2xl font-black text-gray-900 dark:text-cream mb-1">{plan.name}</h3>

            {/* Price */}
            <div className="mt-4 mb-2 flex items-end gap-1">
                <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                    ৳{priceDisplay?.toLocaleString()}
                </span>
                <span className="text-gray-400 dark:text-gray-500 font-bold text-sm mb-1.5">
                    / {isYearly ? 'yr' : 'mo'}
                </span>
            </div>

            {/* Savings badge — only when yearly is selected */}
            <div className="h-7 mb-4">
                {isYearly && savingPercent > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-black text-olive dark:text-lightSage bg-olive/10 dark:bg-lightSage/10 border border-olive/20 dark:border-lightSage/20 px-3 py-1 rounded-full">
                        🎉 Save {savingPercent}% vs monthly
                    </span>
                )}
            </div>

            <div className="w-full h-px bg-gradient-to-r from-gray-200 via-gray-300 to-transparent dark:from-gray-800 dark:via-gray-700 mb-6" />

            {/* Features */}
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
                                ? plan.recurringDayOfWeek.split(',').map(d => d.trim().charAt(0) + d.trim().slice(1).toLowerCase()).join(', ')
                                : 'TBD'}`}
                        />
                        <FeatureItem title="Time" sub={`${plan.recurringStartTime || 'TBD'} (${plan.durationMinutes || 60} mins)`} />
                        {plan.description && <FeatureItem title="About" sub={plan.description} />}
                    </>
                )}
            </ul>

            {/* CTA */}
            <button
                onClick={() => onSelect(plan)}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-black text-base transition-all duration-300 flex items-center justify-center gap-2
                    ${isPremium
                        ? 'bg-olive text-white hover:bg-olive/90 dark:bg-lightSage dark:text-darkBg dark:hover:bg-lightSage/90'
                        : 'bg-gray-900 text-white hover:bg-black dark:bg-gray-800 dark:text-cream dark:hover:bg-gray-700'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
                {isLoading ? (
                    <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" /> Connecting...</>
                ) : (
                    `Get Started ${isYearly ? '(Yearly)' : '(Monthly)'}`
                )}
            </button>
        </div>
    );
}

function FeatureItem({ title, sub, highlight }) {
    return (
        <li className={`flex items-start text-sm ${highlight ? 'text-olive dark:text-lightSage font-bold' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
            <div className="w-5 h-5 rounded-full bg-olive/10 dark:bg-lightSage/10 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <svg className="w-3 h-3 text-olive dark:text-lightSage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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