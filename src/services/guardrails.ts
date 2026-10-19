import type { GuardrailResult, Intent, Urgency } from '../types';

export class GuardrailEngine {
  // 1. Adversarial Prompt Injection Patterns
  private static readonly PROMPT_INJECTION_PATTERNS = [
    /\bignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|prompts|rules)\b/i,
    /\bdisregard\s+(all\s+)?(previous|prior|safety|hr)\s+(rules|guidelines|directives|filters)\b/i,
    /\byou\s+are\s+no\s+longer\s+(an?\s+)?hr\b/i,
    /\byou\s+are\s+now\s+(an?\s+)?(autohire|dan|jailbreak|unrestricted|godmode|admin|root)\b/i,
    /\b(system\s+prompt\s+reset|new\s+system\s+instructions\s+follow|admin\s+command)\b/i,
    /\b(dump_system_prompt|execute\s+dump|print\s+(all\s+)?previous\s+instructions)\b/i,
    /\b(internal\s+system\s+directives|scoring\s+weights|hidden\s+developer\s+instructions)\b/i,
    /\b(emergency\s+red\s+team\s+drill|executive\s+override|bypass\s+human-in-the-loop)\b/i,
    /\b(this\s+is\s+(cto|ceo|vp)\b.*(drill|simulation|authorized|mandated))\b/i,
    /\b(reply\s+only\s+with|in\s+your\s+proposed\s+draft,\s+output\s+exactly)\b/i,
    /<\/?(system|system_directive|candidate_submission|candidate_input|override|instructions?)\b/i,
    /\[(override\s+hr\s+policies|system_directive|system_override|admin_override)\]/i,
  ];

  // 2. Offer Confirmation Trap Patterns
  private static readonly OFFER_CONFIRMATION_PATTERNS = [
    /\bconfirm(ing)?\s+(this\s+|my\s+|the\s+)?offer\b/i,
    /\b(told\s+me|said)\s+I\s+(got\s+the\s+job|got\s+the\s+role|got\s+an\s+offer|am\s+hired)\b/i,
    /\bextended\s+an\s+offer\s+with\s+(a\s+)?\$?\d+[\d,]*/i,
    /\bconfirm\s+everything\s+before\s+\d+\s*(pm|am)?\s*today\b/i,
    /\bofficial\s+signable\s+contract\b/i,
    /\bso\s+I\s+can\s+submit\s+my\s+(two-week\s+)?resignation\b/i,
    /\bsend\s+the\s+official\s+offer\s+letter\b/i,
    /\bguarantee\s+that\s+the\s+salary\s+will\s+be\b/i,
    /\bwelcome\s+to\s+the\s+(team|company)\b/i,
    /\bcongratulations!?\s+you\s+have\s+been\s+selected\b/i,
  ];

  // 3. Sensitive Legal / Discrimination / EEOC Patterns
  private static readonly SENSITIVE_LEGAL_PATTERNS = [
    /\b(eeoc|disparate\s+impact|discrimination|discriminatory)\b/i,
    /\b(retaliation|sexual\s+harassment|hostile\s+work\s+environment)\b/i,
    /\b(general\s+counsel|litigation\s+hold|preserve\s+all\s+(interview\s+)?notes)\b/i,
    /\b(filing\s+a\s+formal\s+complaint|legal\s+counsel|lawsuit|attorney)\b/i,
    /\b(subpoena|wage\s+theft|unlawful\s+practice)\b/i,
  ];

  // 4. Conflicting Intent Indicator Patterns
  private static readonly CONFLICT_PATTERNS: [RegExp, RegExp][] = [
    [/\breschedule\b/i, /\bwithdraw\b/i],
    [/\breschedule\b/i, /\b(unless\s+you\s+(can\s+)?guarantee|salary\s+will\s+be\s+at\s+least)\b/i],
    [/\baccept(ed)?\s+another\s+offer\b/i, /\bmove\s+(our\s+)?interview\b/i],
  ];

  /**
   * Scans candidate subject and body for directive safety violations.
   */
  public static scan(subject: string, body: string, senderName: string = ''): GuardrailResult {
    const combinedText = `${subject}\n${body}`.trim();
    const flags: string[] = [];
    const notes: string[] = [];
    let safeDraftOverride: string | undefined;
    let forcedIntent: Intent | undefined;
    let forcedUrgency: Urgency | undefined;

    // Rule 1: Check for Adversarial Prompt Injections
    let injectionCount = 0;
    for (const pat of this.PROMPT_INJECTION_PATTERNS) {
      if (pat.test(combinedText)) {
        injectionCount++;
      }
    }

    if (injectionCount > 0) {
      flags.push('ADVERSARIAL_PROMPT_INJECTION');
      notes.push(
        `Adversarial prompt injection pattern detected (${injectionCount} rules triggered). ` +
        `Candidate input attempted to override model instructions. Directives mandate routing to REQUIRES_MANUAL_REVIEW.`
      );
      forcedIntent = 'REQUIRES_MANUAL_REVIEW';
      forcedUrgency = 'CRITICAL';
      safeDraftOverride =
        `Dear ${senderName || 'Applicant'},\n\n` +
        `Thank you for contacting the Talent Acquisition team. Your message has been received and ` +
        `routed directly to our HR Operations security and compliance desk for manual review.\n\n` +
        `Sincerely,\nHR Operations`;
    }

    // Rule 2: Check for Sensitive Legal / EEOC Claims
    let legalCount = 0;
    for (const pat of this.SENSITIVE_LEGAL_PATTERNS) {
      if (pat.test(combinedText)) {
        legalCount++;
      }
    }

    if (legalCount > 0) {
      flags.push('SENSITIVE_LEGAL_ESCALATION');
      notes.push(
        'Sensitive legal, discrimination, or EEOC regulatory claim detected. ' +
        'Bypassing automated drafting; routed immediately to Senior HRBP and Legal Counsel.'
      );
      forcedIntent = 'REQUIRES_MANUAL_REVIEW';
      forcedUrgency = 'CRITICAL';
      safeDraftOverride =
        `Dear ${senderName || 'Applicant'},\n\n` +
        `We acknowledge receipt of your correspondence. Your communication has been forwarded directly to ` +
        `Senior People Leadership and Legal Counsel for formal review and response.\n\n` +
        `Sincerely,\nPeople Operations & Legal Affairs`;
    }

    // Rule 3: Check for Offer Confirmation Traps (Directive 1: NEVER confirm offers)
    let offerCount = 0;
    for (const pat of this.OFFER_CONFIRMATION_PATTERNS) {
      if (pat.test(combinedText)) {
        offerCount++;
      }
    }

    if (offerCount > 0) {
      flags.push('OFFER_CONFIRMATION_TRAP');
      notes.push(
        'Candidate message attempts to confirm, negotiate binding terms, or extract an unauthorized offer acceptance. ' +
        'Strict adherence to final_directive.md prohibits automated offer confirmation.'
      );
      forcedIntent = 'REQUIRES_MANUAL_REVIEW';
      if (!forcedUrgency || forcedUrgency !== 'CRITICAL') {
        forcedUrgency = 'HIGH';
      }
      if (!safeDraftOverride) {
        safeDraftOverride =
          `Dear ${senderName || 'Applicant'},\n\n` +
          `Thank you for reaching out to us. Please note that all official hiring decisions, compensation details, ` +
          `and formal written offer documentation are handled exclusively by your assigned Talent Acquisition Partner.\n\n` +
          `We do not confirm or validate employment offers through automated correspondence. ` +
          `I have flagged your message for your recruiter's immediate manual attention.\n\n` +
          `Best regards,\nTalent Acquisition Operations`;
      }
    }

    // Rule 4: Check for Conflicting Multi-Intents
    let conflictDetected = false;
    for (const [pat1, pat2] of this.CONFLICT_PATTERNS) {
      if (pat1.test(combinedText) && pat2.test(combinedText)) {
        conflictDetected = true;
        break;
      }
    }

    if (conflictDetected) {
      flags.push('CONFLICTING_MULTI_INTENT');
      notes.push(
        'Multiple incompatible candidate intents detected (e.g., reschedule alongside conditional withdrawal or salary demand). ' +
        'Directive 3 mandates human escalation to clarify candidate intent.'
      );
      forcedIntent = 'REQUIRES_MANUAL_REVIEW';
      if (!forcedUrgency) {
        forcedUrgency = 'HIGH';
      }
      if (!safeDraftOverride) {
        safeDraftOverride =
          `Hi ${senderName || 'there'},\n\n` +
          `Thank you for contacting us. Because your message touches on both scheduling and application status, ` +
          `our recruiting coordinator is reviewing your file to ensure we address all your points accurately.\n\n` +
          `We will follow up with you shortly.\n\n` +
          `Best regards,\nRecruiting Team`;
      }
    }

    // Rule 5: Check for Ambiguous / Low Information Queries / Punctuation Only
    const words = combinedText.split(/\s+/).filter(Boolean);
    const isPunctuationOnly = /^[\s\p{P}]+$/u.test(combinedText) || combinedText.length === 0;

    if (
      (words.length < 5 || isPunctuationOnly) &&
      !flags.includes('ADVERSARIAL_PROMPT_INJECTION') &&
      !flags.includes('OFFER_CONFIRMATION_TRAP')
    ) {
      flags.push('AMBIGUOUS_SHORT_QUERY');
      notes.push(
        `Candidate input is extremely brief (${words.length} words or punctuation only) and lacks context for high-confidence classification. ` +
        `Directives mandate routing to REQUIRES_MANUAL_REVIEW.`
      );
      forcedIntent = 'REQUIRES_MANUAL_REVIEW';
      forcedUrgency = 'LOW';
      safeDraftOverride =
        `Hi ${senderName || 'there'},\n\n` +
        `Thank you for reaching out! Could you please provide a bit more context or detail regarding your inquiry ` +
        `so we can connect you with the right team member?\n\n` +
        `Best regards,\nRecruiting Team`;
    }

    const isSafe = flags.length === 0;

    return {
      isSafe,
      forcedIntent,
      forcedUrgency,
      flags,
      reasoningNotes: notes,
      safeDraftOverride,
    };
  }

  /**
   * Validates proposed or edited draft to ensure it does NOT violate core directives.
   */
  public static postValidateDraft(draft: string): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];
    const forbidden: [RegExp, string][] = [
      [/\byou\s+are\s+hired\b/i, "Prohibited phrase: 'you are hired'"],
      [/\bconfirm(ing)?\s+your\s+offer\s+of\b/i, "Prohibited phrase: 'confirming your offer of'"],
      [/\bstarting\s+salary\s+of\s+\$?\d+/i, "Prohibited phrase: 'starting salary of $'"],
      [/\bautohire\b/i, "Detected leaked injection token: 'autohire'"],
      [/\bwelcome\s+to\s+the\s+company\b/i, "Prohibited premature welcoming phrase: 'welcome to the company'"],
      [/\bINTERNAL\s+SYSTEM\s+DIRECTIVES\s+EXPOSED\b/i, 'Detected leaked prompt injection banner'],
      [/\bwe\s+offer\s+you\s+\$?\d+/i, "Prohibited phrase: 'we offer you $'"],
      [/\bsign\s+your\s+(attached\s+)?offer\b/i, "Prohibited phrase: 'sign your offer'"],
    ];

    for (const [pat, desc] of forbidden) {
      if (pat.test(draft)) {
        violations.push(desc);
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  }
}
