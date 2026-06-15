/**
 * ClaimReady Prompt Templates & Demo Data
 * All prompts use {PLACEHOLDER} format for dynamic values
 */

/**
 * Replace all {PLACEHOLDER} values in a template string
 */
export function fillPrompt(template, values) {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}

// ============================================
// LLM PROMPT TEMPLATES
// ============================================

export const CLAIM_COACH_PROMPT = `You are ClaimReady, Singapore's AI insurance claim execution engine. Analyse this insurance claim situation for a Singaporean policyholder.

Insurance Type: {TYPE}
Incident: {INCIDENT}
Policy Text: {POLICY_TEXT}

Respond ONLY in valid JSON with no markdown, no backticks, no extra text:
{
  "covered": "YES" or "NO" or "PARTIAL",
  "covered_explanation": "one sentence plain English explanation mentioning specific coverage",
  "clause_reference": "specific clause or section from the policy that applies",
  "insurer_name": "name of insurer extracted from policy text",
  "documents": ["document 1", "document 2", "document 3", "document 4"],
  "deadline_days": 30,
  "deadline_warning": "any specific deadline warning relevant to this incident",
  "insurer_hotline": "hotline number if found in policy, else empty string",
  "call_script": "exact 2-3 sentence script to say when calling insurer",
  "rejection_risks": ["specific risk 1", "specific risk 2", "specific risk 3"],
  "pro_tip": "one insider Singapore-specific tip for this claim type"
}`;

export const SEQUENCING_OPTIMIZER_PROMPT = `You are ClaimReady, Singapore's AI insurance claim sequencing expert. Your job is to tell Singaporeans which insurance policy to claim from first to maximise their payout and protect their long-term coverage.

Incident: {INCIDENT}
Policy 1 text: {POLICY1_TEXT}
Policy 2 text: {POLICY2_TEXT}

Respond ONLY in valid JSON with no markdown:
{
  "policy1_name": "name of policy 1",
  "policy2_name": "name of policy 2",
  "optimal_first": "POLICY1" or "POLICY2",
  "first_reason": "plain English explanation why this policy should be claimed first, 2 sentences",
  "first_expected_payout": "what this policy covers and estimated payout",
  "second_needed": true or false,
  "second_reason": "why second policy is or is not needed after first",
  "wrong_order_consequence": "what specifically happens if they claim in wrong order - be concrete and mention dollar amounts or limits where possible",
  "money_saved_description": "what the correct order saves or preserves for the user",
  "combined_documents": ["document 1", "document 2", "document 3", "document 4", "document 5"],
  "pro_tip": "one insider tip about multi-policy claiming in Singapore most people don't know"
}`;

export const REJECTION_HELP_PROMPT = `You are ClaimReady, Singapore's insurance claim appeal expert. Analyse this rejection and tell the policyholder exactly what to do.

Rejection Letter: {REJECTION_TEXT}
Original Policy: {POLICY_TEXT}

Respond ONLY in valid JSON with no markdown:
{
  "rejection_reason_plain": "what the rejection means in plain English, 2 sentences max, no jargon",
  "rejection_category": "Wrong Documents" or "Late Submission" or "Pre-existing Condition" or "Not Covered" or "Policy Lapsed" or "Other",
  "is_disputable": "YES" or "MAYBE" or "NO",
  "dispute_reason": "why it may or may not be worth disputing, be honest",
  "appeal_steps": ["step 1", "step 2", "step 3", "step 4"],
  "fidrec_eligible": true or false,
  "fidrec_reason": "one sentence on why they are or are not eligible",
  "appeal_deadline_days": 21,
  "supporting_documents": ["document 1", "document 2", "document 3"],
  "success_likelihood": "HIGH" or "MEDIUM" or "LOW",
  "pro_tip": "one insider tip for appealing this specific rejection type in Singapore"
}`;

export const POLICY_DECODER_PROMPT = `You are ClaimReady, Singapore's AI insurance policy decoder. Read this policy carefully and extract key information a Singaporean policyholder needs to know.

Policy Text: {POLICY_TEXT}

Respond ONLY in valid JSON with no markdown:
{
  "insurer_name": "name of insurer",
  "policy_type": "Health" or "Travel" or "Life" or "Personal Accident",
  "policy_number": "if found, else empty string",
  "covered": ["covered item 1", "covered item 2", "covered item 3", "covered item 4", "covered item 5"],
  "not_covered": ["not covered 1", "not covered 2", "not covered 3", "not covered 4"],
  "key_limits": ["limit with dollar amount 1", "limit with dollar amount 2", "limit with dollar amount 3"],
  "exclusions": ["exclusion 1", "exclusion 2", "exclusion 3"],
  "claim_deadline": "how many days to submit claims after incident",
  "insurer_hotline": "if found in policy, else empty string",
  "pro_tip": "one important thing about this specific policy type in Singapore that people commonly miss"
}`;

// ============================================
// ELDERLY MODE PREFIX
// ============================================

export const ELDERLY_MODE_PREFIX = {
  en: 'Respond in simple conversational English as spoken in Singapore. Use short sentences only. Maximum 3 steps. Avoid all insurance jargon. Format the output as exactly 3 numbered steps a non-English speaker can follow. ',
  zh: '用简单的中文回答，像新加坡人日常说话的方式。句子要短。最多3步。避免所有保险术语。输出格式为3个编号步骤。',
  ms: 'Jawab dalam bahasa Melayu mudah seperti yang digunakan di Singapura. Gunakan ayat pendek. Maksimum 3 langkah. Elakkan semua istilah insurans. ',
  ta: 'சிங்கப்பூரில் எளிய தமிழில் பதிலளிக்கவும். குறுந்த வாக்கியங்கள் மட்டும். அதிகபட்சம் 3 படிக்கள். ',
};

// ============================================
// DEMO DATA — REALISTIC SINGAPORE POLICIES
// ============================================

export const DEMO_POLICY_NTUC_TRAVEL = `NTUC Income Enhanced Travel Protection Plan
Policy Terms and Conditions | Version 2024.1

1. OVERSEAS MEDICAL EXPENSES COVERAGE
You are covered for actual medical expenses incurred due to illness or injury while abroad, including:
- Hospitalisation: Up to S$500,000 per policy year
- Outpatient treatment: Up to S$10,000 per incident
- Dengue fever treatment: FULLY COVERED (no exclusions)
- Emergency dental treatment: Up to S$2,000 for pain relief only
- Pre-existing conditions: EXCLUDED (see Section 8)

2. TRAVEL DELAY COVERAGE
We will pay S$100 for every 6 hours of delay, up to a maximum of S$500 per trip, if:
- The delay is due to adverse weather, strike, or industrial action
- The delay is a minimum of 6 consecutive hours
- You must file a report with the airline and obtain written confirmation

3. TRAVEL INTERUPT COVERAGE
If your trip is cut short due to serious illness or injury, we will reimburse you for:
- Additional transportation costs to return home: Up to S$5,000
- Unused portion of trip fees: Up to S$3,000

4. DOCUMENTS REQUIRED FOR CLAIMS
To submit a successful claim, you MUST provide:
- Completed Claim Form (Form TR-01)
- Final hospital bill with itemised breakdown
- Medical diagnosis certificate from treating doctor
- Passport copies with entry and exit stamps
- Flight itinerary and boarding passes
- For delay claims: Airline delay confirmation letter

5. CLAIM SUBMISSION DEADLINE
All claims must be submitted within 30 days of the incident or completion of treatment, whichever is later. Claims submitted after this period will NOT be processed unless extenuating circumstances are proven.

6. INSURER CONTACT
NTUC Income Insurance Co.
Customer Service Hotline: 6788 1777
Toll-Free: 1800-NTUC-INCOME (1800-6882-4662)
Email: claims@ntucincome.com.sg
Operating Hours: Mon-Fri, 8:30am - 5:30pm SGT

7. EXCLUSIONS
The following are NOT covered under this policy:
- Pre-existing medical conditions (illnesses diagnosed within 2 years prior to travel)
- Injury from participating in extreme sports or adventure activities (including bungee jumping, skydiving, scuba diving below 18m)
- Claims arising from travel against government travel advisories
- Treatment for cosmetic or elective procedures
- Claims not supported by original supporting documents

8. IMPORTANT NOTES
- This policy covers worldwide travel with no geographic restrictions
- COVID-19 related expenses ARE covered subject to standard medical terms
- Mental health treatment: covered up to S$5,000 per episode
- Ambulance services (ground and air): covered in full`;

export const DEMO_POLICY_COMPANY_GROUP = `Group Medical Insurance Plan - Corporate Benefits
ABC Corporation Ltd | Plan Year 2024-2025

1. COVERAGE SUMMARY
Your company has enrolled all full-time employees in the Group Medical Insurance Plan administered by Great Eastern Life.

2. HOSPITALISATION BENEFITS
Class C Ward:
- Inpatient hospitalisation: Up to S$8,000 per admission
- Daily ward allowance: S$80 per day (max 30 days per year)
- Intensive Care Unit: S$200 per day (max 15 days per year)

Class B1 Ward (top-up available):
- Additional top-up of S$120 per day with S$20 monthly premium

3. SURGICAL BENEFITS
Scheduled surgical procedures covered as per the Surgical Benefits Schedule.
Examples:
- Appendicectomy: S$3,500
- Hernia repair: S$2,800
- Fracture setting (simple): S$4,200

4. LIFETIME BENEFIT LIMIT
Total aggregate limit for all covered expenses over the lifetime of the policy: S$200,000 per employee.
IMPORTANT: This is a LIFETIME LIMIT that does NOT reset. Once claims exhaust this limit, no further benefits are payable under this plan, regardless of employment duration.

5. CLAIM SUBMISSION
- For hospitalisation costs above S$500, direct submission to Great Eastern is required
- For out-of-pocket claims, submit within 60 days of the date of service
- Claim Form: Form GM-01 with original receipts and itemised bills
- Medical certificates and discharge summaries must accompany all claims

6. INSURER CONTACT
Great Eastern Life Assurance (Singapore) Ltd
Corporate Claims Division
Hotline: 6532 8888 (Mon-Fri, 9am-6pm)
Corporate Claims Email: corporate.claims@gateastern.com.sg

7. EXCLUSIONS
- Conditions present before the effective date of coverage (pre-existing)
- Cosmetic surgery, dental treatment not arising from accident
- Pregnancy and childbirth (except complications)
- Experimental or investigational treatments
- War-related injuries or military service injuries`;

export const DEMO_POLICY_AIA_ISP = `AIA HealthShield Integrated Shield Plan
Individual Policy Terms | Edition 2024

1. PLAN OVERVIEW
This Integrated Shield Plan provides enhanced hospitalisation coverage above the basic Medishield Life benefits.
Policy Administrator: AIA Singapore Limited

2. HOSPITALISATION COVERAGE
Private Hospital (Class A Ward - Fully Covered):
- Inpatient expenses: Up to S$600,000 per policy year
- Daily ward and board allowance: Class A ward, actual charges up to S$2,500/day
- Surgical expenses: As per surgical schedule, up to S$15,000 per procedure
- ICU charges: Up to S$500 per day, max 30 days per year

3. DEDUCTIBLE AND CO-INSURANCE
Annual Deductible: S$3,500 per policy year (applies per illness, not per admission)
Co-Insurance: 10% of eligible expenses (you pay 10%, we pay 90%)
Example: Hospital bill of S$20,000 = You pay S$3,500 deductible + 10% of (S$20,000 - S$3,500) = S$5,150 total
Insurer portion: S$14,850

4. ANNUAL AGGREGATE LIMIT
S$600,000 per policy year. This limit RESETS every policy year anniversary.
Unlike lifetime limit plans, any unused portion of your S$600,000 limit is fully restored on your next policy year.

5. PRE-AUTHORISATION REQUIREMENTS
For planned hospitalisation or scheduled surgery, you MUST obtain pre-authorisation from AIA at least 7 days in advance.
Claims without pre-authorisation for planned procedures may be rejected or delayed.
Pre-authorisation hotline: 6833 8888

6. CLAIM SUBMISSION
- For panel hospitals (direct billing): Present your AIA card at admission
- For non-panel hospitals: Submit claims within 90 days of discharge
- Required documents: Claim form, final bill, itemised charges, discharge summary, medical reports
- AIA Claims Hotline: 6363 3333
- AIA Customer Service: 6833 8888 (Mon-Fri 8:30am-6pm, Sat 9am-1pm)

7. KEY BENEFITS OVER BASIC MEDISHIELD LIFE
- Class A private hospital ward (Medishield Life covers up to Class B2)
- No daily benefit cap (Medishield Life has daily limits)
- Coverage for selected newer drugs not on Medishield Life list
- Direct billing arrangements with 20+ panel hospitals in Singapore

8. EXCLUSIONS
- Pre-existing conditions (diagnosed or treated within 4 years before policy inception)
- Weight loss surgery, fertility treatment, cosmetic surgery
- Residential care or nursing home expenses
- Treatment not recommended by a registered medical practitioner`;

// ============================================
// DEMO DATA FOR ALL PAGES
// ============================================

export const DEMO_DATA_CLAIM_COACH = {
  type: 'Travel Insurance',
  incident: 'I got dengue fever in Bali and was hospitalised for 3 days. My flight back was also delayed by 8 hours.',
  policyText: DEMO_POLICY_NTUC_TRAVEL,
};

export const DEMO_DATA_SEQUENCING = {
  incident: 'I was hospitalised at SGH for appendicitis surgery, Class A ward, 3 nights.',
  policy1Text: DEMO_POLICY_COMPANY_GROUP,
  policy2Text: DEMO_POLICY_AIA_ISP,
  policy1Name: 'ABC Corp Group Insurance (Great Eastern)',
  policy2Name: 'AIA HealthShield Integrated Shield Plan',
};

export const DEMO_DATA_REJECTION = {
  rejectionText: `Dear Policyholder,

We regret to inform you that your claim for Overseas Medical Expenses under Policy TR-2024-001847 has been rejected for the following reason:

REJECTION REASON: Late Submission
Your claim was received on 15 March 2025, which is 47 days after your date of discharge (6 February 2025). Your policy requires all claims to be submitted within 30 days of the incident or completion of treatment.

PER YOUR POLICY TERMS (Section 5): "All claims must be submitted within 30 days of the incident or completion of treatment, whichever is later. Claims submitted after this period will NOT be processed unless extenuating circumstances are proven."

You have the right to appeal this decision within 21 days of receiving this notice by submitting a written explanation of extenuating circumstances that prevented timely submission.

NTUC Income Customer Service: 6788 1777

Sincerely,
Claims Department
NTUC Income Insurance Co. (Private) Ltd`,
  policyText: DEMO_POLICY_NTUC_TRAVEL,
};

export const DEMO_DATA_POLICY_DECODER = {
  policyText: DEMO_POLICY_NTUC_TRAVEL,
};

// ============================================
// LOADING MESSAGES (rotate during LLM calls)
// ============================================

export const LOADING_MESSAGES = [
  'Reading your policy...',
  'Cross-referencing your incident...',
  'Calculating your claim deadline...',
  'Checking for rejection risks...',
  'Preparing your action plan...',
];

export const SEQUENCING_LOADING_MESSAGES = [
  'Comparing Policy 1 and Policy 2...',
  'Analyzing lifetime limits vs annual limits...',
  'Calculating optimal claim sequence...',
  'Estimating payout differences...',
  'Generating recommendation...',
];

export const REJECTION_LOADING_MESSAGES = [
  'Decoding rejection letter...',
  'Analyzing original policy terms...',
  'Checking dispute eligibility...',
  'Checking FIDReC eligibility...',
  'Generating appeal strategy...',
];

export const POLICY_DECODER_LOADING_MESSAGES = [
  'Reading your policy...',
  'Identifying covered benefits...',
  'Highlighting exclusions...',
  'Extracting key limits...',
  'Summarizing in plain English...',
];