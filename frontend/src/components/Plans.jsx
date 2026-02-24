import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackButton from './BackButton';

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
                const response = await axios.get('http://localhost:8080/api/membership-plans');
                // Filter only active plans
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
            // FIXED THE URL HERE to match your SubscriptionController!
            const response = await axios.post('http://localhost:8080/api/subscriptions/initiate-payment', {
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
            console.error(error); // Add this so you can see the exact error in the F12 console!
            alert("Payment setup failed. Please try again.");
            setIsLoading(false);
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton />

                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Membership Plans</h2>

                    {/* Billing Toggle Switch */}
                    <div className="flex justify-center items-center space-x-4 mt-8">
                        <span className={`text-sm ${billingCycle === 'monthly' ? 'font-bold text-blue-600' : 'text-gray-500'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className="relative w-14 h-7 bg-gray-300 rounded-full transition-colors duration-200 focus:outline-none"
                        >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm ${billingCycle === 'yearly' ? 'translate-x-7' : ''}`}></div>
                        </button>
                        <span className={`text-sm ${billingCycle === 'yearly' ? 'font-bold text-blue-600' : 'text-gray-500'}`}>Yearly (Save 15%+)</span>
                    </div>
                </div>

                {isFetching ? (
                    <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {gymPlans.sort((a, b) => a.tierLevel - b.tierLevel).map((plan) => (
                            <div key={plan.id} className={`bg-white rounded-2xl shadow-sm border p-8 flex flex-col ${plan.tierLevel === 2 ? 'border-blue-500 ring-2 ring-blue-100 scale-105' : 'border-gray-200'}`}>
                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>

                                <div className="mt-4 mb-6">
                                    <span className="text-4xl font-black">৳{billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}</span>
                                    <span className="text-gray-500 text-sm ml-1">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-center text-gray-600">
                                        <CheckIcon /> {plan.classLimitPerMonth === -1 ? 'Unlimited' : plan.classLimitPerMonth} Monthly Classes
                                    </li>
                                    <li className="flex items-center text-gray-600">
                                        <CheckIcon /> {plan.ptSessionsPerMonth} Personal Training Sessions
                                    </li>
                                    <li className="flex items-center text-gray-600">
                                        <CheckIcon /> Full Gym Floor Access
                                    </li>
                                </ul>

                                <button
                                    onClick={() => handleSelectPlan(plan)}
                                    disabled={isLoading}
                                    className={`w-full py-3 rounded-xl font-bold transition-all ${plan.tierLevel === 2 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                >
                                    {isLoading && loadingPlan === plan.id ? 'Connecting...' : 'Choose Plan'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Simple SVG Component
function CheckIcon() {
    return (
        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
    );
}