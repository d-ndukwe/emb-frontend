import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
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

type IconName =
  | 'fuel' | 'barrel' | 'pump' | 'plane' | 'building' | 'leaf' | 'wheat'
  | 'flame' | 'cloud' | 'bricks' | 'sprout' | 'truck' | 'package' | 'ship' | 'chat';

const iconShapes: Record<IconName, ReactNode> = {
  fuel: <><path d="M12 3.5c-2.3 3.1-5.1 6.2-5.1 10.1a5.1 5.1 0 0 0 10.2 0c0-3.9-2.8-7-5.1-10.1Z" /><path d="M9.5 14.5c.2 1.2 1 2 2.2 2.3" /></>,
  barrel: <><path d="M6 4.5h12l1 2.5v10l-1 2.5H6L5 17V7l1-2.5Z" /><path d="M5.3 8h13.4M5.3 16h13.4M8 5v14m8-14v14" /></>,
  pump: <><path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h7A1.5 1.5 0 0 1 15 5.5V20M4 20h12" /><path d="M7.5 7h5v4h-5zM15 7h2l2 2v6.5a1.5 1.5 0 0 1-3 0V13" /></>,
  plane: <><path d="m3 14 7.3-1.7 2.1-7.1a1.6 1.6 0 0 1 3.1.3l-.7 6 4.8-1.1a2.4 2.4 0 0 1 2.5 1.1l.3.5-7.5 3.1-3.3 5.2-1.4.3.8-4.8L5 17.4 3 19l-.9-.4 2.1-3.2L3 14Z" /></>,
  building: <><path d="M4 20V9l8-5 8 5v11M8 20v-5h8v5M8 10h.01M12 10h.01M16 10h.01" /><path d="M3 20h18" /></>,
  leaf: <><path d="M19.5 4.5c-7.8 0-13 3.2-13 9.1a5.9 5.9 0 0 0 5.9 5.9c5.9 0 7.1-7.3 7.1-15Z" /><path d="M4 21c3.1-5 6.5-7.8 12-11" /></>,
  wheat: <><path d="M12 21V4M12 8c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4Zm0 4c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4Zm0 4c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4Zm0 0c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4Z" /><path d="M8 21h8" /></>,
  flame: <><path d="M12 3c1 3.4 4.5 4.8 4.5 9.2A4.5 4.5 0 0 1 12 16.7a4.3 4.3 0 0 1-4.5-4.4c0-2.6 1.2-4.6 3-6.4-.1 2.3 1 3.2 1.7 3.6C13.5 7.4 12.9 5 12 3Z" /><path d="M9.5 16.3a3.8 3.8 0 0 0 2.5 4.2 3.8 3.8 0 0 0 2.5-4.2" /></>,
  cloud: <><path d="M7 18h10a4 4 0 0 0 .5-8 5.8 5.8 0 0 0-11-.7A4.4 4.4 0 0 0 7 18Z" /><path d="M9 21h.01M13 21h.01M17 21h.01" /></>,
  bricks: <><path d="M4 7h7v5H4zM13 7h7v5h-7zM4 14h7v5H4zM13 14h7v5h-7z" /><path d="M11 7v5m2 2v5" /></>,
  sprout: <><path d="M12 21v-9" /><path d="M12 15c0-4-2.5-6-7-6 0 4.5 2.5 6 7 6Zm0-4c0-4 2.5-6 7-6 0 4.5-2.5 6-7 6Z" /><path d="M8 21h8" /></>,
  truck: <><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7" /><circle cx="7.5" cy="18" r="1.7" /><circle cx="17.5" cy="18" r="1.7" /></>,
  package: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v9M8 5.2l8 4.5" /></>,
  ship: <><path d="M3 14h18l-2.2 5H6l-3-5Z" /><path d="M7 14V7h10v7M10 7V4h4v3M4 21l2-2m4 2 2-2m4 2 2-2" /></>,
  chat: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.3-3.1A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8.5 11.5h7M8.5 14.5h4" /></>,
};

function AppIcon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      {iconShapes[name]}
    </svg>
  );
}

// 2. The Slide Animation rules
const slideVariants = {
  hidden: { x: 50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { x: -50, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }
} as Variants

const reducedMotionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
} as Variants

// 3. Product catalogue with icons
const PRODUCTS = [
  { id: 'EN590',         label: 'EN590 Diesel',          icon: 'fuel' },
  { id: 'AGO',           label: 'AGO Diesel',             icon: 'barrel' },
  { id: 'PMS',           label: 'PMS (Petrol)',           icon: 'pump' },
  { id: 'JET_A1',        label: 'Jet A1 Fuel',           icon: 'plane' },
  { id: 'CEMENT',        label: 'Cement',                 icon: 'building' },
  { id: 'INDORAMA',      label: 'Indorama Fert.',         icon: 'leaf' },
  { id: 'UREA',          label: 'Urea Fertilizer',        icon: 'wheat' },
  { id: 'LPG',           label: 'LPG Gas',                icon: 'flame' },
  { id: 'LNG',           label: 'LNG Gas',                icon: 'cloud' },
  { id: 'BUILDING_MATS', label: 'Building Mats',          icon: 'bricks' },
  { id: 'AGRIC_PRODS',   label: 'Agricultural',           icon: 'sprout' },
] as const;

// 4. Delivery methods with icons
const DELIVERY_METHODS = [
  { id: 'TANKER',  label: 'Tanker Truck',  icon: 'truck' },
  { id: 'FLATBED', label: 'Flatbed',        icon: 'truck' },
  { id: 'BAGGED',  label: 'Bagged Cargo',  icon: 'package' },
  { id: 'SHIP',    label: 'Ship / Vessel', icon: 'ship' },
] as const;

// ─── Tailwind class helpers ──────────────────────────────────────────────────
const inputCls = 'form-input';

const selectCls = 'form-input form-select';

const labelCls = 'form-label';

const btnPrimary = 'button-primary';

const btnBack = 'button-secondary';

const btnSubmit = 'button-submit';

// ─── Step progress indicator ──────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const steps = ['Product', 'Volume', 'Logistics', 'Contact'];
  return (
    <div className="stepper" role="group" aria-label={`Step ${step} of ${steps.length}: ${steps[step - 1]}`}>
      <div className="stepper-heading">
        <span className="stepper-current">{steps[step - 1]}</span>
        <span className="stepper-count">Step {step} of {steps.length}</span>
      </div>
      <div className="stepper-track" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step} aria-label="Request progress">
        <span className="stepper-fill" style={{ width: `${(step / steps.length) * 100}%` }} />
      </div>
    </div>
  );
}

// ─── Gold accent bar under headings ──────────────────────────────────────────
function GoldBar() {
  return <div className="step-accent" aria-hidden="true" />;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LeadForm() {
  const [step, setStep]               = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]     = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const stepVariants = shouldReduceMotion ? reducedMotionVariants : slideVariants;

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
      <div className="form-card form-card-success">
        <div className="success-content">
          {/* Check ring */}
          <div className="success-mark" aria-hidden="true">
            <span>✓</span>
          </div>

          <h2 className="success-title">
            Request Secured!
          </h2>
          <GoldBar />

          <p className="success-copy">
            Your details have been saved. Click below to send your order directly to Mr. Hillary and begin negotiations.
          </p>

          {/* Order summary card */}
          <div className="success-summary">
            {[
              ['Product',  productLabel],
              ['Quantity', `${submittedData.cargo_quantity} ${submittedData.measurement_unit}`],
              ['Delivery', deliveryLabel],
              ['To',       submittedData.destination],
            ].map(([key, val]) => (
              <div key={key} className="flex justify-between gap-4">
                <span className="summary-label">{key}</span>
                <span className="summary-value">{val}</span>
              </div>
            ))}
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-link"
          >
            <AppIcon name="chat" className="icon-md" />
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
      className="form-card"
    >
      {/* Brand header */}
      <div className="form-header">
        <div className="brand-mark" aria-hidden="true">
          {/* Minimal ship/globe SVG echoing the logo */}
          <svg className="brand-mark-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
            <ellipse cx="12" cy="10" rx="3.5" ry="7" stroke="currentColor" strokeWidth="1.1" />
            <line x1="5" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="1.1" />
            <path d="M4 18 Q12 14 20 18 L18.5 21 Q12 17 5.5 21Z" fill="currentColor" />
            <polygon points="12,7 10.5,17.5 13.5,17.5" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
        <div className="brand-copy">
          <p className="brand-title">
            EMB TRADE LOGISTICS
          </p>
          <p className="brand-subtitle">Nigeria Limited</p>
        </div>
        <span className="portal-tag">Quote request</span>
      </div>

      {/* Step progress bar */}
      <div>
        <StepBar step={step} />
      </div>

      {/* Form body */}
      <div className="form-content">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">

            {/* ── STEP 1: PRODUCT SELECTION ─────────────────────────────── */}
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                <h2 className="step-title">What are you sourcing today?</h2>
                <p className="step-description">Choose the commodity you need.</p>
                <GoldBar />

                {/* Product chip grid */}
                <div
                  className="product-grid"
                  role="radiogroup"
                  aria-label="Product type"
                >
                  {PRODUCTS.map((prod) => {
                    const isSelected = watch('product_type') === prod.id;
                    return (
                      <label key={prod.id} className={`product-option${isSelected ? ' is-selected' : ''}`}>
                        <input type="radio" value={prod.id} {...register('product_type', { required: true })} />
                        <span className="product-icon"><AppIcon name={prod.icon} className="icon-md" /></span>
                        <span className="product-label">{prod.label}</span>
                        <span className="product-check" aria-hidden="true">✓</span>
                      </label>
                    );
                  })}
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
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                <h2 className="step-title">Volume &amp; quantity</h2>
                <p className="step-description">Set the amount and preferred measurement.</p>
                <GoldBar />

                <div className="field-row">
                  <div className="field-grow">
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
                  <div className="field-unit">
                    <label className={labelCls} htmlFor="measurement_unit">Unit</label>
                    <select
                      id="measurement_unit"
                      className={selectCls}
                      {...register('measurement_unit')}
                    >
                      <option value="MT">MT</option>
                      <option value="LITRES">Litres</option>
                      <option value="CBM">CBM</option>
                      <option value="PCS">PCS</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
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
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                <h2 className="step-title">Delivery &amp; destination</h2>
                <p className="step-description">Tell us how and where it should arrive.</p>
                <GoldBar />

                <div className="mb-4">
                  <label className={labelCls}>Delivery method</label>
                  <div className="delivery-grid" role="radiogroup" aria-label="Delivery method">
                    {DELIVERY_METHODS.map((method) => {
                      const isSelected = watch('delivery_type') === method.id;
                      return (
                        <label key={method.id} className={`delivery-option${isSelected ? ' is-selected' : ''}`}>
                          <input type="radio" value={method.id} {...register('delivery_type', { required: true })} />
                          <AppIcon name={method.icon} className="icon-md" />
                          <span>{method.label}</span>
                        </label>
                      );
                    })}
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

                <div className="form-actions">
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
              <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit">
                <h2 className="step-title">Where should we send the quote?</h2>
                <p className="step-description">Add your business and contact details.</p>
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

                <div className="form-actions">
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
