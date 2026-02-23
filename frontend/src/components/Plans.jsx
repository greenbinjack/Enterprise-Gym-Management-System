import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Plans() {
    const [user, setUser] = useState(null);
    const [plans, setPlans] = useState([]);
    const [billingCycle, setBillingCycle] = useState('MONTHLY');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Checkout states
    const [cardToken, setCardToken] = useState('');
    const [checkoutMsg, setCheckoutMsg] = useState({ type: '', text: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
        } else {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchPlans(parsedUser.id);
        }
    }, [navigate]);

    const fetchPlans = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/subscriptions/plans/${userId}`);
            setPlans(response.data);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        }
    };

    const openCheckout = (plan) => {
        setSelectedPlan(plan);
        setCheckoutMsg({ type: '', text: '' });
        setCardToken('');
        setIsModalOpen(true);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setCheckoutMsg({ type: '', text: '' });

        const payload = {
            userId: user.id,
            planId: selectedPlan.id,
            billingCycle: billingCycle,
            // creditCardToken is no longer needed!
        };

        try {
            const response = await axios.post('http://localhost:8080/api/subscriptions/initiate-payment', payload);

            // Redirect the user to the SSLCommerz hosted page!
            window.location.href = response.data.gatewayUrl;

        } catch (error) {
            setCheckoutMsg({ type: 'error', text: error.response?.data?.error || "Failed to connect to gateway" });
            setIsProcessing(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
                    <div className="inline-flex bg-gray-200 rounded-lg p-1">
                        <button onClick={() => setBillingCycle('MONTHLY')} className={`px-6 py-2 rounded-md font-semibold ${billingCycle === 'MONTHLY' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Monthly</button>
                        <button onClick={() => setBillingCycle('YEARLY')} className={`px-6 py-2 rounded-md font-semibold ${billingCycle === 'YEARLY' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}>Yearly (Save 15%)</button>
                    </div>
                </div>

                {/* Plan Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex flex-col hover:shadow-xl transition-shadow">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                            <div className="text-4xl font-extrabold text-blue-600 mb-6">
                                ${billingCycle === 'MONTHLY' ? plan.monthlyPrice : plan.yearlyPrice}
                                <span className="text-sm text-gray-400 font-normal"> / {billingCycle.toLowerCase()}</span>
                            </div>
                            <ul className="mb-8 space-y-3 flex-grow text-gray-600">
                                <li>✓ {plan.classLimitPerMonth === 999 ? 'Unlimited' : plan.classLimitPerMonth} Classes/mo</li>
                                <li>✓ {plan.ptSessionsPerMonth} PT Sessions/mo</li>
                                <li>✓ 24/7 Gym Access</li>
                            </ul>
                            <button onClick={() => openCheckout(plan)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                                Select {plan.name}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Checkout Modal Overlay */}
            {isModalOpen && selectedPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold">&times;</button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Checkout</h2>

                        {/* Order Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">{selectedPlan.name} ({billingCycle})</span>
                                <span className="font-bold">${billingCycle === 'MONTHLY' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice}</span>
                            </div>
                            <hr className="my-2 border-gray-300" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>${billingCycle === 'MONTHLY' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice}</span>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {checkoutMsg.type === 'error' && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{checkoutMsg.text}</div>}
                        {checkoutMsg.type === 'success' && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm font-bold">✓ {checkoutMsg.text} Redirecting...</div>}

                        {/* Payment Form (Redirects to SSLCommerz) */}
                        {!checkoutMsg.type.includes('success') && (
                            <form onSubmit={handlePayment}>
                                <p className="text-sm text-gray-500 mb-6">
                                    You will be redirected to SSLCommerz to complete your purchase securely using Cards, bKash, or Nagad.
                                </p>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className={`w-full text-white font-bold py-3 rounded-lg transition-colors ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                                    {isProcessing ? 'Connecting to Gateway...' : `Proceed to Pay $${billingCycle === 'MONTHLY' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice}`}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}