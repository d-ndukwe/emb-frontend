import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
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
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { x: -50, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }
} as Variants

// 3. Product catalogue with icons
const PRODUCTS = [
  { id: 'EN590',         label: 'EN590 Diesel',          icon: '⛽' },
  { id: 'AGO',           label: 'AGO Diesel',             icon: '🛢️' },
  { id: 'PMS',           label: 'PMS (Petrol)',           icon: '⛽' },
  { id: 'JET_A1',        label: 'Jet A1 Fuel',           icon: '✈️' },
  { id: 'CEMENT',        label: 'Cement',                 icon: '🏗️' },
  { id: 'INDORAMA',      label: 'Indorama Fert.',         icon: '🌿' },
  { id: 'UREA',          label: 'Urea Fertilizer',        icon: '🌾' },
  { id: 'LPG',           label: 'LPG Gas',                icon: '🔥' },
  { id: 'LNG',           label: 'LNG Gas',                icon: '💨' },
  { id: 'BUILDING_MATS', label: 'Building Mats',          icon: '🧱' },
  { id: 'AGRIC_PRODS',   label: 'Agricultural',           icon: '🌽' },
];

// 4. Delivery methods with icons
const DELIVERY_METHODS = [
  { id: 'TANKER',  label: 'Tanker Truck',  icon: '🚛' },
  { id: 'FLATBED', label: 'Flatbed',        icon: '🚚' },
  { id: 'BAGGED',  label: 'Bagged Cargo',  icon: '📦' },
  { id: 'SHIP',    label: 'Ship / Vessel', icon: '🚢' },
];

// ─── Tailwind class helpers ──────────────────────────────────────────────────
const inputCls =
  'w-full bg-white/[0.06] border border-white/[0.18] text-white rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200 placeholder:text-white/30 focus:border-[#F5C700] focus:bg-[#F5C700]/[0.06]';

const selectCls =
  'w-full bg-white/[0.06] border border-white/[0.18] text-white rounded-xl px-4 py-3.5 text-sm outline-none cursor-pointer transition-all duration-200 focus:border-[#F5C700] appearance-none bg-no-repeat bg-[right_14px_center]';

const labelCls = 'block text-[11px] font-medium tracking-widest uppercase text-white/50 mb-2';

const btnPrimary =
  'flex-1 bg-[#F5C700] hover:bg-[#ffd000] text-[#0E3A8C] font-bold py-3.5 px-5 rounded-xl transition-all duration-200 text-sm tracking-wider uppercase disabled:opacity-35 disabled:cursor-not-allowed hover:shadow-[0_4px_20px_rgba(245,199,0,0.35)] hover:-translate-y-px active:translate-y-0';

const btnBack =
  'px-5 py-3.5 rounded-xl border border-white/20 bg-transparent text-white/70 hover:text-white hover:border-white/40 text-sm font-medium transition-all duration-200 shrink-0';

const btnSubmit =
  'flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-3.5 px-5 rounded-xl transition-all duration-200 text-sm tracking-wider uppercase disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-[0_4px_20px_rgba(22,163,74,0.35)]';

// ─── Step progress indicator ──────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const steps = ['Product', 'Volume', 'Logistics', 'Contact'];
  return (
    <div className="px-7 pt-5">
      {/* Dots + lines */}
      <div className="flex items-center" role="list" aria-label="Form progress">
        {steps.map((_, i) => {
          const n = i + 1;
          const isDone   = n < step;
          const isActive = n === step;
          return (
            <div key={n} className="flex items-center flex-1 last:flex-none" role="listitem">
              <div
                aria-current={isActive ? 'step' : undefined}
                className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300',
                  isDone   ? 'bg-[#C8DC00] border-2 border-[#C8DC00] text-[#0E3A8C] shadow-[0_0_10px_rgba(200,220,0,0.35)]' : '',
                  isActive ? 'bg-[#F5C700] border-2 border-[#F5C700] text-[#0E3A8C] shadow-[0_0_14px_rgba(245,199,0,0.5)]' : '',
                  !isDone && !isActive ? 'border-2 border-white/20 text-white/40' : '',
                ].join(' ')}
              >
                {isDone ? '✓' : n}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px mx-1.5 transition-all duration-300 ${isDone ? 'bg-[#C8DC00]' : 'bg-white/15'}`}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Labels */}
      <div className="flex mt-1.5" aria-hidden="true">
        {steps.map((label, i) => {
          const n = i + 1;
          return (
            <span
              key={label}
              className={[
                'flex-1 last:flex-none text-center text-[9px] tracking-widest uppercase font-medium transition-colors duration-300',
                n < step  ? 'text-[#C8DC00]' : '',
                n === step ? 'text-[#F5C700]' : '',
                n > step  ? 'text-white/30' : '',
              ].join(' ')}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Gold accent bar under headings ──────────────────────────────────────────
function GoldBar() {
  return <div className="w-9 h-0.5 bg-[#F5C700] rounded-full mb-5 mt-1" />;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LeadForm() {
  const [step, setStep]               = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]     = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: { measurement_unit: 'MT', delivery_type: 'TANKER' },
  });

  const nextStep = () => setStep((p) => p + 1);
  const prevStep = () => setStep((p) => p - 1);

  // 3. The API Trigger
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/leads/submit/`, data);
      setSubmittedData(data);
      setIsSuccess(true);
    } catch (error) {
      console.error('Submission failed', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success / WhatsApp screen ─────────────────────────────────────────────
  if (isSuccess && submittedData) {
    const productNames: Record<string, string> = {
      AGO: 'Diesel (AGO)', PMS: 'Petrol (PMS)', JET_A1: 'Jet A-1', UREA: 'Urea Fertilizer',
    };
    const productLabel =
      PRODUCTS.find((p) => p.id === submittedData.product_type)?.label ??
      productNames[submittedData.product_type] ??
      submittedData.product_type;

    const deliveryLabel =
      DELIVERY_METHODS.find((d) => d.id === submittedData.delivery_type)?.label ??
      submittedData.delivery_type;

    const message = `Good day, this is ${submittedData.company_name}. We are seeking ${submittedData.cargo_quantity} ${submittedData.measurement_unit} of ${submittedData.product_type}${submittedData.specific_details ? ` (${submittedData.specific_details})` : ''} to be delivered to ${submittedData.destination} via ${submittedData.delivery_type}. My contact is: ${submittedData.contact_info}`;

    // FORMATTING RULE: Country code (234) without the '+' symbol, followed by the number without the leading zero.
    const hillaryWhatsAppNumber = '2348033548557';
    const whatsappUrl = `https://wa.me/${hillaryWhatsAppNumber}?text=${encodeURIComponent(message)}`;

    return (
      <div className="relative overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(160deg,#0E3A8C 0%,#071f55 60%,#040f2e 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'rgba(245,199,0,0.07)' }} />
        <div className="absolute -top-14 -left-14 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(200,220,0,0.05)' }} />

        <div className="relative z-10 flex flex-col items-center text-center px-8 py-12">
          {/* Check ring */}
          <div className="w-20 h-20 rounded-full border-2 border-green-500 bg-green-500/15 flex items-center justify-center mb-6 text-4xl">
            ✓
          </div>

          <h2 className="text-4xl font-black tracking-tight text-white mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Request Secured!
          </h2>
          <GoldBar />

          <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
            Your details have been saved. Click below to send your order directly to Mr. Hillary and begin negotiations.
          </p>

          {/* Order summary card */}
          <div className="w-full rounded-xl border border-[#F5C700]/20 bg-[#F5C700]/6 p-4 text-sm mb-8 text-left space-y-2">
            {[
              ['Product',  productLabel],
              ['Quantity', `${submittedData.cargo_quantity} ${submittedData.measurement_unit}`],
              ['Delivery', deliveryLabel],
              ['To',       submittedData.destination],
            ].map(([key, val]) => (
              <div key={key} className="flex justify-between gap-4">
                <span className="text-white/40 shrink-0">{key}</span>
                <span className="text-white font-medium text-right">{val}</span>
              </div>
            ))}
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 text-base tracking-wide shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-px active:translate-y-0"
          >
            <span className="text-xl">💬</span>
            Proceed to Deal (WhatsApp)
          </a>
        </div>
      </div>
    );
  }

  // ── Multi-step form ───────────────────────────────────────────────────────
  const productType = watch('product_type');
  const needsSpec   = productType === 'BUILDING_MATS' || productType === 'AGRIC_PRODS';

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ background: 'linear-gradient(160deg,#0E3A8C 0%,#071f55 60%,#040f2e 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'rgba(245,199,0,0.07)' }} />
      <div className="absolute -top-14 -left-14 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(200,220,0,0.05)' }} />

      {/* Brand header */}
      <div className="relative z-10 flex items-center gap-3 px-7 pt-5">
        <div
          className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center"
          style={{ background: '#F5C700', boxShadow: '0 0 0 3px rgba(245,199,0,0.25)' }}
          aria-hidden="true"
        >
          {/* Minimal ship/globe SVG echoing the logo */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="10" r="7" stroke="#0E3A8C" strokeWidth="1.4" fill="none" />
            <ellipse cx="12" cy="10" rx="3.5" ry="7" stroke="#0E3A8C" strokeWidth="1.1" fill="none" />
            <line x1="5" y1="10" x2="19" y2="10" stroke="#0E3A8C" strokeWidth="1.1" />
            <path d="M4 18 Q12 14 20 18 L18.5 21 Q12 17 5.5 21Z" fill="#0E3A8C" />
            <polygon points="12,7 10.5,17.5 13.5,17.5" fill="#0E3A8C" opacity="0.5" />
          </svg>
        </div>
        <div>
          <p className="text-white font-black text-sm tracking-[0.08em] leading-none" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            EMB TRADE LOGISTICS
          </p>
          <p className="text-[#F5C700] text-[10px] tracking-[0.12em] uppercase mt-0.5">Nigeria Limited</p>
        </div>
      </div>

      {/* Step progress bar */}
      <div className="relative z-10">
        <StepBar step={step} />
      </div>

      {/* Form body */}
      <div className="relative z-10 px-7 pt-6 pb-7">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">

            {/* ── STEP 1: PRODUCT SELECTION ─────────────────────────────── */}
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit">
                <h2 className="text-3xl font-black text-white leading-tight tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  What are you<br />sourcing today?
                </h2>
                <GoldBar />

                {/* Product chip grid */}
                <div
                  className="grid grid-cols-3 gap-2 mb-5 max-h-60 overflow-y-auto pr-1"
                  role="radiogroup"
                  aria-label="Product type"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}
                >
                  {PRODUCTS.map((prod) => (
                    <label
                      key={prod.id}
                      className={[
                        'cursor-pointer border rounded-xl p-2.5 text-center transition-all duration-200 flex flex-col items-center gap-1 select-none',
                        watch('product_type') === prod.id
                          ? 'border-[#F5C700] bg-[#F5C700]/12'
                          : 'border-white/15 bg-white/4 hover:border-[#F5C700]/50 hover:bg-[#F5C700]/6',
                      ].join(' ')}
                    >
                      <input type="radio" value={prod.id} className="sr-only" {...register('product_type', { required: true })} />
                      <span className="text-lg" aria-hidden="true">{prod.icon}</span>
                      <span className={`text-[11px] font-semibold leading-tight ${watch('product_type') === prod.id ? 'text-[#F5C700]' : 'text-white/75'}`}>
                        {prod.label}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Conditional specifics input */}
                {needsSpec && (
                  <div className="mb-5">
                    <label className={labelCls} htmlFor="specific_details">
                      Specify exact materials needed
                    </label>
                    <input
                      id="specific_details"
                      type="text"
                      className={inputCls}
                      placeholder="e.g. 12mm Iron Rods, Grade 42..."
                      {...register('specific_details', { required: needsSpec })}
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    !watch('product_type') ||
                    (needsSpec && !watch('specific_details'))
                  }
                  className={`w-full ${btnPrimary}`}
                >
                  Continue — Volume & Quantity →
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: VOLUME ────────────────────────────────────────── */}
            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit">
                <h2 className="text-3xl font-black text-white leading-tight tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Volume &<br />Quantity
                </h2>
                <GoldBar />

                <div className="flex gap-3 mb-6">
                  <div className="flex-2">
                    <label className={labelCls} htmlFor="cargo_quantity">Quantity</label>
                    <input
                      id="cargo_quantity"
                      type="number"
                      step="0.01"
                      className={inputCls}
                      placeholder="e.g. 33,000"
                      {...register('cargo_quantity', { required: true, min: 1 })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className={labelCls} htmlFor="measurement_unit">Unit</label>
                    <select
                      id="measurement_unit"
                      className={selectCls}
                      style={{ backgroundColor: '#0E3A8C/10'
                      }}
                      {...register('measurement_unit')}
                    >
                      <option value="MT">MT</option>
                      <option value="LITRES">Litres</option>
                      <option value="CBM">CBM</option>
                      <option value="PCS">PCS</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button type="button" onClick={prevStep} className={btnBack}>← Back</button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!watch('cargo_quantity')}
                    className={btnPrimary}
                  >
                    Continue to Delivery →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: LOGISTICS ─────────────────────────────────────── */}
            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit">
                <h2 className="text-3xl font-black text-white leading-tight tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Delivery &<br />Destination
                </h2>
                <GoldBar />

                <div className="mb-4">
                  <label className={labelCls}>Delivery method</label>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Delivery method">
                    {DELIVERY_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={[
                          'cursor-pointer border rounded-xl p-3 flex items-center gap-2.5 transition-all duration-200 select-none',
                          watch('delivery_type') === method.id
                            ? 'border-[#F5C700] bg-[#F5C700]/10'
                            : 'border-white/15 bg-white/4 hover:border-[#F5C700]/50',
                        ].join(' ')}
                      >
                        <input type="radio" value={method.id} className="sr-only" {...register('delivery_type', { required: true })} />
                        <span className="text-xl" aria-hidden="true">{method.icon}</span>
                        <span className={`text-sm font-semibold ${watch('delivery_type') === method.id ? 'text-[#F5C700]' : 'text-white/75'}`}>
                          {method.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className={labelCls} htmlFor="destination">Delivery destination</label>
                  <textarea
                    id="destination"
                    rows={3}
                    className={`${inputCls} resize-none`}
                    placeholder="Full address or port location..."
                    {...register('destination', { required: true })}
                  />
                </div>

                <div className="flex gap-2.5">
                  <button type="button" onClick={prevStep} className={btnBack}>← Back</button>
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!watch('destination')}
                    className={btnPrimary}
                  >
                    Continue to Contact →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: THE HANDSHAKE ─────────────────────────────────── */}
            {step === 4 && (
              <motion.div key="step4" variants={slideVariants} initial="hidden" animate="visible" exit="exit">
                <h2 className="text-3xl font-black text-white leading-tight tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Where should we<br />send the quote?
                </h2>
                <GoldBar />

                <div className="mb-4">
                  <label className={labelCls} htmlFor="company_name">Company / buyer name</label>
                  <input
                    id="company_name"
                    type="text"
                    className={inputCls}
                    placeholder="e.g. Acme Corp or John Doe"
                    {...register('company_name', { required: true })}
                  />
                </div>

                <div className="mb-6">
                  <label className={labelCls} htmlFor="contact_info">WhatsApp number or email</label>
                  <input
                    id="contact_info"
                    type="text"
                    className={inputCls}
                    placeholder="e.g. +234... or name@company.com"
                    {...register('contact_info', { required: true })}
                  />
                </div>

                <div className="flex gap-2.5">
                  <button type="button" onClick={prevStep} className={btnBack}>← Back</button>
                  <button
                    type="submit"
                    disabled={!watch('company_name') || !watch('contact_info') || isSubmitting}
                    className={btnSubmit}
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Processing…</span>
                    ) : (
                      <>
                        <span>✓</span> Submit Request
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}