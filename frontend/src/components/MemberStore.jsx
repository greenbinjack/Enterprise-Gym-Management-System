import { useState, useEffect } from 'react';
import axios from 'axios';

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
            try {
                // 1. Fetch all available plans for this user's tier
                const plansRes = await axios.get(`http://localhost:8080/api/subscriptions/plans/${currentUser.id}`);
                setPlans(plansRes.data);

                // 2. Fetch active subscriptions to prevent duplicate purchases
                const subRes = await axios.get(`http://localhost:8080/api/subscriptions/status/${currentUser.id}`);
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
            const res = await axios.post('http://localhost:8080/api/subscriptions/initiate-payment', {
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
            // Show the exact error message thrown by our backend validation
            alert(error.response?.data?.error || "Could not connect to payment gateway.");
            setIsProcessing(false);
        }
    };

    const displayedPlans = plans.filter(p => p.category === activeTab);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-screen">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Membership & Packages</h2>
            <p className="text-gray-500 mb-8">Choose a base gym access plan, or purchase guaranteed spots in specialized class programs.</p>

            {/* TAB SELECTOR */}
            <div className="flex space-x-4 mb-8 bg-gray-200 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('BASE_MEMBERSHIP')}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'BASE_MEMBERSHIP' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    General Gym Access
                </button>
                <button
                    onClick={() => setActiveTab('CLASS_PACKAGE')}
                    className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'CLASS_PACKAGE' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    Specialty Class Packages
                </button>
            </div>

            {/* PLAN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedPlans.length === 0 && (
                    <div className="col-span-full p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-lg font-medium mb-2">No plans available.</p>
                        <p className="text-sm">Check back later for new offerings in this category.</p>
                    </div>
                )}

                {displayedPlans.map(plan => {
                    const isOwned = ownedPlanIds.includes(plan.id);

                    return (
                        <div key={plan.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                            <div className="p-8 bg-gray-900 text-white text-center">
                                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                                <div className="text-4xl font-extrabold text-blue-400">
                                    ৳{plan.monthlyPrice} <span className="text-sm font-normal text-gray-400">/ mo</span>
                                </div>
                            </div>
                            <div className="p-8 flex-1 bg-white">
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center text-gray-700">
                                        <span className="text-green-500 mr-3 text-lg">✔</span>
                                        <span className="font-medium">{plan.classLimitPerMonth === 999 ? 'Unlimited Classes' : `${plan.classLimitPerMonth} Classes / month`}</span>
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <span className="text-green-500 mr-3 text-lg">✔</span>
                                        <span className="font-medium">{plan.ptSessionsPerMonth} PT Sessions</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-3">
                                <button
                                    onClick={() => handleBuy(plan.id, 'MONTHLY')}
                                    disabled={isProcessing || isOwned}
                                    className={`w-full font-bold py-3 rounded-xl shadow transition-colors ${isOwned ? 'bg-green-100 text-green-800 cursor-not-allowed border border-green-200' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                >
                                    {isOwned ? '✔ Currently Active' : (isProcessing ? 'Connecting...' : 'Pay Monthly')}
                                </button>

                                {plan.category === 'BASE_MEMBERSHIP' && !isOwned && (
                                    <button
                                        onClick={() => handleBuy(plan.id, 'YEARLY')}
                                        disabled={isProcessing}
                                        className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-gray-400 disabled:text-gray-400 font-bold py-3 rounded-xl shadow transition-colors"
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