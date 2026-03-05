import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Plans() {
    const navigate = useNavigate();
    const [gymPlans, setGymPlans] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'
    const [isLoading, setIsLoading] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState(null);

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
        const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

        setIsLoading(true);
        setLoadingPlan(plan.id);

        try {
            const response = await api.post('/api/subscriptions/initiate-payment', {
                userId: user.id,
                planId: plan.id,
                amount: price,
                planName: `${plan.name} (${billingCycle})`,
                billingCycle: billingCycle
            });

            if (response.data?.gatewayUrl) {
                window.location.href = response.data.gatewayUrl;
            }
        } catch (error) {
            console.error(error);
            alert("Payment setup failed. Please try again.");
            setIsLoading(false);
            setLoadingPlan(null);
        }
    };

    const basePackages = gymPlans.filter(plan => plan.category === 'BASE_MEMBERSHIP');
    const classwisePackages = gymPlans.filter(plan => plan.category === 'CLASS_PACKAGE');

    const getYearlyPrice = (plan) => {
        if (plan.yearlyPrice && plan.yearlyPrice > 0) return plan.yearlyPrice;
        return plan.monthlyPrice * 12 * 0.85; // 15% discount
    };

    return (
        <div className="min-h-screen bg-cream dark:bg-darkBg transition-colors pt-32 pb-12 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
            {/* Background decorative blobs */}
            <div className="absolute top-0 -left-40 w-96 h-96 bg-lightSage/20 dark:bg-olive/5 rounded-full filter blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 -right-40 w-96 h-96 bg-brown/10 dark:bg-lightSage/5 rounded-full filter blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Controls Removed */}

                <div className="text-center mb-20">
                    <span className="text-olive dark:text-lightSage font-bold uppercase tracking-widest text-sm mb-4 block">Membership Options</span>
                    <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-cream tracking-tighter mb-6">Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive to-brown dark:from-lightSage dark:to-cream">Journey.</span></h2>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">Select the perfect tier to match your fitness ambitions. All memberships include standard full-facility 24/7 access.</p>

                    {/* Billing Toggle Switch */}
                    <div className="flex justify-center items-center space-x-6 mt-12 bg-white/50 dark:bg-darkCard/50 backdrop-blur-sm shadow-sm inline-flex p-2 rounded-full border border-gray-200 dark:border-gray-800">
                        <span className={`text-sm tracking-widest uppercase pl-4 transition-colors ${billingCycle === 'monthly' ? 'font-black text-gray-900 dark:text-cream' : 'text-gray-400 dark:text-gray-500 font-bold'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className="relative w-16 h-8 bg-gray-200 dark:bg-gray-800 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive dark:focus:ring-offset-darkBg shadow-inner"
                        >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-olive dark:bg-lightSage rounded-full transition-transform duration-300 shadow-md ${billingCycle === 'yearly' ? 'translate-x-8' : ''}`}></div>
                        </button>
                        <span className={`text-sm tracking-widest uppercase pr-4 flex items-center gap-2 transition-colors ${billingCycle === 'yearly' ? 'font-black text-gray-900 dark:text-cream' : 'text-gray-400 dark:text-gray-500 font-bold'}`}>
                            Yearly <span className="text-[10px] bg-olive/10 dark:bg-lightSage/20 text-olive dark:text-lightSage border border-olive/20 dark:border-lightSage/30 px-2.5 py-1 rounded-full animate-pulse">Save 15%</span>
                        </span>
                    </div>
                </div>

                {isFetching ? (
                    <div className="flex justify-center h-64 items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage"></div>
                    </div>
                ) : (
                    <div className="space-y-24">
                        {/* Base Packages Section */}
                        {basePackages.length > 0 && (
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-cream text-center mb-12 uppercase tracking-tight">Base <span className="text-olive dark:text-lightSage">Packages</span></h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
                                    {basePackages.sort((a, b) => a.monthlyPrice - b.monthlyPrice).map((plan) => (
                                        <PlanCard key={plan.id} plan={plan} billingCycle={billingCycle} isLoading={isLoading} loadingPlan={loadingPlan} handleSelectPlan={handleSelectPlan} getYearlyPrice={getYearlyPrice} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Classwise Packages Section */}
                        {classwisePackages.length > 0 && (
                            <div>
                                <div className="w-full max-w-lg mx-auto h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mb-16"></div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-cream text-center mb-12 uppercase tracking-tight">Classwise <span className="text-olive dark:text-lightSage">Packages</span></h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
                                    {classwisePackages.sort((a, b) => a.monthlyPrice - b.monthlyPrice).map((plan) => (
                                        <PlanCard key={plan.id} plan={plan} billingCycle={billingCycle} isLoading={isLoading} loadingPlan={loadingPlan} handleSelectPlan={handleSelectPlan} getYearlyPrice={getYearlyPrice} />
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

function PlanCard({ plan, billingCycle, isLoading, loadingPlan, handleSelectPlan, getYearlyPrice }) {
    const isPremium = plan.monthlyPrice > 5000 && plan.monthlyPrice < 15000;
    const priceDisplay = billingCycle === 'monthly' ? (plan.monthlyPrice || 0) : getYearlyPrice(plan);

    return (
        <div
            className={`relative bg-white dark:bg-darkCard rounded-[2rem] shadow-xl transition-all duration-500 flex flex-col p-10
                ${isPremium
                    ? 'border-2 border-olive dark:border-lightSage transform md:-translate-y-4 z-10 shadow-olive/10 dark:shadow-lightSage/5'
                    : 'border border-gray-100 dark:border-gray-800 hover:-translate-y-2 hover:shadow-2xl'
                }`}
        >
            {isPremium && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-olive to-brown text-white dark:from-lightSage dark:to-olive dark:text-darkBg text-xs font-black uppercase tracking-widest py-1.5 px-6 rounded-full shadow-lg border border-white/20">
                        Most Popular
                    </span>
                </div>
            )}

            <h3 className="text-3xl font-black text-gray-900 dark:text-cream mb-4">{plan.name}</h3>

            <div className="mb-8 flex items-baseline">
                <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                    ৳{priceDisplay.toLocaleString()}
                </span>
                <span className="text-gray-500 dark:text-gray-400 font-bold ml-2">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-gray-200 via-gray-300 to-transparent dark:from-gray-800 dark:via-gray-700 mb-8"></div>

            <ul className="space-y-6 mb-12 flex-1">
                {plan.category === 'BASE_MEMBERSHIP' ? (
                    <>
                        {isPremium ? (
                            <>
                                <li className="flex items-start text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                    <CheckIcon />
                                    <span>
                                        <strong className="text-gray-900 dark:text-white block">Elite Facility Access</strong>
                                        <span className="text-sm opacity-80">Unrestricted 24/7 gym floor entry across all locations</span>
                                    </span>
                                </li>
                                <li className="flex items-start text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                    <CheckIcon />
                                    <span>
                                        <strong className="text-gray-900 dark:text-white block">Dedicated Personal Trainer</strong>
                                        <span className="text-sm opacity-80">2 complimentary PT sessions per month</span>
                                    </span>
                                </li>
                                <li className="flex items-start text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                    <CheckIcon />
                                    <span>
                                        <strong className="text-gray-900 dark:text-white block">Nutrition & Diet Plan</strong>
                                        <span className="text-sm opacity-80">Monthly personalized macro & diet tracking</span>
                                    </span>
                                </li>
                                <li className="flex items-start text-olive dark:text-lightSage font-bold leading-relaxed">
                                    <CheckIcon />
                                    <span>
                                        <strong className="text-gray-900 dark:text-white block">Premium Amenities</strong>
                                        <span className="text-sm opacity-80 font-medium">Towel service, private lockers & luxury showers</span>
                                    </span>
                                </li>
                                <li className="flex items-start text-olive dark:text-lightSage font-bold leading-relaxed">
                                    <CheckIcon />
                                    <span>
                                        <span className="block">VIP Recovery Lounge</span>
                                        <span className="text-sm opacity-80 font-medium">Sauna, ice bath & massage therapy access</span>
                                    </span>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="flex items-start text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                    <CheckIcon />
                                    <span>
                                        <strong className="text-gray-900 dark:text-white block">Standard Facility Access</strong>
                                        <span className="text-sm opacity-80">24/7 gym floor entry at home location</span>
                                    </span>
                                </li>
                                <li className="flex items-start text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                    <CheckIcon />
                                    <span>
                                        <strong className="text-gray-900 dark:text-white block">Cardio & Weights Area</strong>
                                        <span className="text-sm opacity-80">Full access to general training zones</span>
                                    </span>
                                </li>
                                <li className="flex items-start text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                    <CheckIcon />
                                    <span>
                                        <strong className="text-gray-900 dark:text-white block">Community Support</strong>
                                        <span className="text-sm opacity-80">Free app tracking and standard community features</span>
                                    </span>
                                </li>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <li className="flex items-start text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                            <CheckIcon />
                            <span>
                                <strong className="text-gray-900 dark:text-white block">Class Capacity: {plan.allocatedSeats || 'N/A'}</strong>
                                <span className="text-sm opacity-80">Limited spots available</span>
                            </span>
                        </li>
                        <li className="flex items-start text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                            <CheckIcon />
                            <span>
                                <strong className="text-gray-900 dark:text-white block">Schedule</strong>
                                <span className="text-sm opacity-80 capitalize">
                                    Every {plan.recurringDayOfWeek ? plan.recurringDayOfWeek.split(',').map(d => d.toLowerCase()).join(', ') : 'TBD'}
                                </span>
                            </span>
                        </li>
                        <li className="flex items-start text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                            <CheckIcon />
                            <span>
                                <strong className="text-gray-900 dark:text-white block">Time</strong>
                                <span className="text-sm opacity-80">
                                    {plan.recurringStartTime || 'TBD'} ({plan.durationMinutes || 60} mins)
                                </span>
                            </span>
                        </li>
                    </>
                )}
            </ul>

            <button
                onClick={() => handleSelectPlan(plan)}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-black text-lg transition-all duration-300 shadow-md transform hover:-translate-y-1
                    ${isPremium
                        ? 'bg-olive text-white hover:bg-olive/90 hover:shadow-olive/30 dark:bg-lightSage dark:text-darkBg dark:hover:bg-cream dark:hover:shadow-lightSage/30'
                        : 'bg-gray-900 text-white hover:bg-black dark:bg-gray-800 dark:text-cream dark:hover:bg-gray-700 hover:shadow-xl'
                    }`}
            >
                {isLoading && loadingPlan === plan.id ? 'Processing...' : 'Select Plan'}
            </button>
        </div>
    );
}

function CheckIcon() {
    return (
        <svg className="h-6 w-6 text-olive dark:text-lightSage mr-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
    );
}