import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// 1. Matches your Django database exactly
type FormData = {
  product_type: string;
  specific_details: string;
  cargo_quantity: number;
  measurement_unit: string;
  delivery_type: string;
  destination: string;
  company_name: string;
  contact_info: string;
};

// 2. The Slide Animation rules
const slideVariants = {
  hidden: { x: 50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  exit: { x: -50, opacity: 0, transition: { duration: 0.3 } }
};

export default function LeadForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { measurement_unit: 'MT', delivery_type: 'TANKER' }
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // 3. The API Trigger
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/leads/submit/`, data);
        setSubmittedData(data);
        setIsSuccess(true);
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && submittedData) {
    // Translate the database codes to clean text for the message
    const productNames = { AGO: 'Diesel (AGO)', PMS: 'Petrol (PMS)', JET_A1: 'Jet A-1', UREA: 'Urea Fertilizer' };
    const productName = productNames[submittedData.product_type as keyof typeof productNames];

    // Construct the exact template you asked for
    const message = `Good day, this is ${submittedData.company_name}. We are seeking ${submittedData.cargo_quantity} ${submittedData.measurement_unit} of ${submittedData.product_type} ${submittedData.specific_details ? `(${submittedData.specific_details})` : ''} to be delivered to ${submittedData.destination} via ${submittedData.delivery_type}. My contact is: ${submittedData.contact_info}`;

    // FORMATTING RULE: Country code (234) without the '+' symbol, followed by the number without the leading zero.
    const hillaryWhatsAppNumber = "2349083791229";
    const whatsappUrl = `https://wa.me/${hillaryWhatsAppNumber}?text=${encodeURIComponent(message)}`;

    return (
      <div className="p-10 text-center text-white">
        <h2 className="text-3xl font-bold text-green-400 mb-4">Request Secured!</h2>
        <p className="mb-8 text-slate-300">Your details have been saved to our system. Click below to send your order directly to Mr. Hillary and begin negotiations.</p>
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg shadow-lg shadow-green-500/30"
        >
          Proceed to Deal (WhatsApp)
        </a>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between text-sm font-medium text-slate-400">
        <span>Step {step} of 4</span>
        <span>EMB Trade Logistics</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          
          {/* STEP 1: PRODUCT SELECTION */}
          {step === 1 && (
            <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-2xl font-bold text-white mb-6">What product are you sourcing today?</h2>
              
              {/* Expanded Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 h-64 overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { id: 'EN590', label: 'EN590 Diesel' }, { id: 'AGO', label: 'AGO Diesel' },
                  { id: 'PMS', label: 'PMS (Petrol)' }, { id: 'JET_A1', label: 'Jet A1 Fuel' },
                  { id: 'CEMENT', label: 'Cement' }, { id: 'INDORAMA', label: 'Indorama Fertilizer' },
                  { id: 'UREA', label: 'Urea Fertilizer' }, { id: 'LPG', label: 'LPG Gas' },
                  { id: 'LNG', label: 'LNG Gas' }, { id: 'BUILDING_MATS', label: 'Building Materials' },
                  { id: 'AGRIC_PRODS', label: 'Agricultural Products' }
                ].map((prod) => (
                  <label key={prod.id} className={`cursor-pointer border rounded-xl p-3 text-sm text-center transition-colors flex items-center justify-center ${watch('product_type') === prod.id ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-600 text-slate-300 hover:border-blue-400'}`}>
                    <input type="radio" value={prod.id} className="hidden" {...register('product_type', { required: true })} />
                    <span className="font-semibold block">{prod.label}</span>
                  </label>
                ))}
              </div>

              {/* Conditional Input for Specifics */}
              {(watch('product_type') === 'BUILDING_MATS' || watch('product_type') === 'AGRIC_PRODS') && (
                <div className="mb-6 animate-fade-in">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Please specify the exact materials needed:</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. 12mm Iron Rods..." 
                    {...register('specific_details', { required: true })} 
                  />
                </div>
              )}

              <button type="button" onClick={nextStep} 
                disabled={!watch('product_type') || ((watch('product_type') === 'BUILDING_MATS' || watch('product_type') === 'AGRIC_PRODS') && !watch('specific_details'))} 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50">
                Continue
              </button>
            </motion.div>
          )}

         {/* STEP 2: VOLUME */}
          {step === 2 && (
            <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-2xl font-bold text-white mb-6">What is the exact volume you require?</h2>
              
              <div className="flex gap-4 mb-6">
                <div className="w-2/3">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Quantity</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. 33000" 
                    {...register('cargo_quantity', { required: true, min: 1 })} 
                  />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Unit</label>
                  <select 
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" 
                    {...register('measurement_unit')}
                  >
                    <option value="LITERS">Liters</option>
                    <option value="CBM">CBM</option>
                    <option value="MT">MT</option>
                    <option value="PCS">PCS</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={prevStep} className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-colors">
                  Back
                </button>
                <button type="button" onClick={nextStep} disabled={!watch('cargo_quantity')} className="w-2/3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 transition-colors">
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: LOGISTICS */}
          {step === 3 && (
            <motion.div key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-2xl font-bold text-white mb-6">How and where should we deliver this?</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Delivery Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {['TANKER', 'FLATBED', 'BAGGED', 'SHIP'].map((method) => (
                    <label key={method} className={`cursor-pointer border rounded-xl p-3 text-center transition-colors text-sm ${watch('delivery_type') === method ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-600 text-slate-300 hover:border-blue-400'}`}>
                      <input type="radio" value={method} className="hidden" {...register('delivery_type', { required: true })} />
                      <span className="font-semibold block">{method === 'SHIP' ? 'Ship / Vessel' : method.charAt(0) + method.slice(1).toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">Delivery Destination</label>
                <textarea 
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                  rows={3} 
                  placeholder="Full address or port location..." 
                  {...register('destination', { required: true })} 
                />
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={prevStep} className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-colors">
                  Back
                </button>
                <button type="button" onClick={nextStep} disabled={!watch('destination')} className="w-2/3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 transition-colors">
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: THE HANDSHAKE */}
          {step === 4 && (
            <motion.div key="step4" variants={slideVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-2xl font-bold text-white mb-6">Where should Mr. Hillary send the quotation?</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Company / Buyer Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="e.g. Acme Corp or John Doe" 
                  {...register('company_name', { required: true })} 
                />
              </div>

             <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">WhatsApp Number OR Email Address</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="e.g. +234... or name@company.com" 
                  {...register('contact_info', { required: true })} 
                />
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={prevStep} className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-colors">
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={!watch('company_name') || !watch('contact_info') || isSubmitting} 
                  className="w-2/3 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 transition-colors flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Additional steps will be slotted here... */}

        </AnimatePresence>
      </form>
    </div>
  );
}