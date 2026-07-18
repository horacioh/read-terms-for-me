import type { ScoringRule, ScoreCategory, TermsScores, CategoryScore } from '../types';

export const DEFAULT_SCORING_RULES: ScoringRule[] = [
  // Privacy — negative signals
  {
    id: 'privacy-data-selling',
    category: 'privacy',
    label: 'Sells or shares personal data',
    description: 'The service sells, rents, leases, or shares personal data with third parties for advertising or other purposes.',
    weight: 8,
    negative: [
      '(?<!not\\s)\\b(sell|sells|selling|sold|rent|rents|renting|rented|lease|leases|leasing|leased)\\b[\\s\\S]{0,80}\\b(your data|user data|personal data|personal information|information about you)',
      '\\b(your data|user data|personal data|personal information)[\\s\\S]{0,80}(?<!not\\s)\\b(sale|sold|sell|rent|lease|share with third|third[- ]part(y|ies))',
      '(?<!not\\s)\\b(data brokers?|advertising partners?|marketing partners?)\\b',
    ],
    enabled: true,
  },
  {
    id: 'privacy-tracking',
    category: 'privacy',
    label: 'Extensive tracking',
    description: 'The service collects behavioral, location, device, or cross-site tracking data.',
    weight: 6,
    negative: [
      '\\b(track|tracks|tracked|tracking|profile|profiles|profiling)\\b[\\s\\S]{0,60}\\b(you|your|user|users|behavior|activity|location|device|cross[- ]site|across sites|browsing)',
      '\\b(pixels?|web beacons?|device fingerprint|analytics|advertising identifiers?|tracking technologies?)\\b',
    ],
    enabled: true,
  },
  {
    id: 'privacy-affiliates',
    category: 'privacy',
    label: 'Broad sharing with affiliates or partners',
    description: 'The service shares data broadly with affiliates, partners, or service providers without clear limits.',
    weight: 5,
    negative: [
      '\\b(affiliates?|subsidiaries?|partners?|service providers?|vendors?)\\b[\\s\\S]{0,60}\\b(data|information|personal information)',
    ],
    enabled: true,
  },
  {
    id: 'privacy-retention',
    category: 'privacy',
    label: 'Indefinite or long data retention',
    description: 'The service retains user data indefinitely or for unclear periods.',
    weight: 5,
    negative: [
      '\\b(retain|retention|keep|store|stores|stored|preserved?)\\b[\\s\\S]{0,60}\\b(indefinite|indefinitely|perpetual|forever|as long as|unlimited|no limit)',
    ],
    enabled: true,
  },
  {
    id: 'privacy-sensitive',
    category: 'privacy',
    label: 'Collects sensitive personal data',
    description: 'The service collects biometric, health, financial, location, or other sensitive data.',
    weight: 6,
    negative: [
      '\\b(biometric|health|medical|financial|payment|credit card|social security|precise location|location data|racial|ethnic|political|religious|sexual orientation)\\b[\\s\\S]{0,40}\\b(data|information)',
    ],
    enabled: true,
  },
  {
    id: 'privacy-minimal',
    category: 'privacy',
    label: 'Minimal data collection',
    description: 'The service states it collects only limited or necessary data.',
    weight: 5,
    positive: [
      '\\b(collect|collects|collection)\\b[\\s\\S]{0,80}\\b(minimal|limited|only necessary|necessary to|only what is necessary|as little as|only the data)',
      '\\b(only collect|only the information|only data that|minimal data)\\b',
    ],
    enabled: true,
  },
  {
    id: 'privacy-encryption',
    category: 'privacy',
    label: 'Encryption and security claims',
    description: 'The service describes encryption or security safeguards for user data.',
    weight: 4,
    positive: [
      '\\b(encrypt|encrypted|encryption|tls|ssl|secure connection|security measures|safeguards?)\\b',
    ],
    enabled: true,
  },
  {
    id: 'privacy-no-selling',
    category: 'privacy',
    label: 'Explicitly does not sell data',
    description: 'The service explicitly states it does not sell or rent personal data.',
    weight: 6,
    positive: [
      '\\b(do not sell|we do not sell|does not sell|not sell|do not rent|do not lease|we do not share|not share|no sale of)\\b[\\s\\S]{0,60}\\b(data|information)',
      '\\b(no third[- ]part(y|ies)|not share with third parties)\\b',
    ],
    enabled: true,
  },
  {
    id: 'privacy-rights',
    category: 'privacy',
    label: 'User data rights (access/delete/portability)',
    description: 'The service provides rights to access, delete, or port personal data.',
    weight: 4,
    positive: [
      '\\b(access|accessing|delete|deletion|erase|erasure|port|portability|correct|rectify|object to|withdraw consent|data subject)\\b[\\s\\S]{0,60}\\b(data|information|personal information)',
      '\\b(gdpr|ccpa|data protection)\\b',
    ],
    enabled: true,
  },

  // User rights — negative signals
  {
    id: 'rights-content-license',
    category: 'userRights',
    label: 'Broad license to user content',
    description: 'The service claims a wide, perpetual, irrevocable, or sublicensable license to content users create.',
    weight: 8,
    negative: [
      '\\b(perpetual|irrevocable|non[- ]exclusive|worldwide|royalty[- ]free|sublicensable|sublicense|transferable|license)\\b[\\s\\S]{0,80}\\b(content|user content|your content|materials|submissions|contributions)',
      '\\b(license\\s+(?:to|for)?\\s*(?:use|display|distribute|reproduce|modify|adapt|publish|perform))\\b',
    ],
    enabled: true,
  },
  {
    id: 'rights-termination',
    category: 'userRights',
    label: 'Termination without notice',
    description: 'The service may terminate or suspend accounts without prior notice or clear recourse.',
    weight: 7,
    negative: [
      '\\b(terminate|suspend|disable|delete|cancel)\\b[\\s\\S]{0,80}\\b(account|access|service|membership)\\b[\\s\\S]{0,60}\\b(at any time|without notice|for any reason|immediately|without prior|with or without cause|in our sole discretion)',
      '\\b(at any time|without notice)[\\s\\S]{0,80}\\b(terminate|suspend|delete|cancel)\\b',
    ],
    enabled: true,
  },
  {
    id: 'rights-arbitration',
    category: 'userRights',
    label: 'Forced arbitration or class-action waiver',
    description: 'The service requires arbitration or waives class-action rights.',
    weight: 8,
    negative: [
      '\\b(arbitration|arbitrate|arbitrator|binding arbitration|individual arbitration)\\b',
      '\\b(class action|class[- ]action|collective action|class[- ]action waiver|jury trial|jury)\\b[\\s\\S]{0,60}\\b(waive|waived|waiver|relinquish|give up|not participate)',
    ],
    enabled: true,
  },
  {
    id: 'rights-no-export',
    category: 'userRights',
    label: 'No right to export or delete data',
    description: 'The service denies or limits user ability to export or delete data.',
    weight: 6,
    negative: [
      '\\b(do not have|not entitled|no right|cannot|unable to|no obligation)\\b[\\s\\S]{0,60}\\b(export|download|port|delete|remove|erase)\\b[\\s\\S]{0,40}\\b(data|content|information)',
    ],
    enabled: true,
  },
  {
    id: 'rights-ownership',
    category: 'userRights',
    label: 'User retains content ownership',
    description: 'The service confirms users retain ownership of their content.',
    weight: 5,
    positive: [
      '\\b(you retain|you own|ownership of|intellectual property|your content remains)\\b[\\s\\S]{0,60}\\b(content|your content|materials|submissions|intellectual property)',
    ],
    enabled: true,
  },
  {
    id: 'rights-termination-notice',
    category: 'userRights',
    label: 'Fair termination notice',
    description: 'The service provides advance notice before terminating or suspending accounts.',
    weight: 4,
    positive: [
      '\\b(notice|advance notice|prior notice|reasonable notice|written notice)\\b[\\s\\S]{0,60}\\b(terminate|termination|suspend|suspension|cancel|cancellation)',
    ],
    enabled: true,
  },
  {
    id: 'rights-portability',
    category: 'userRights',
    label: 'Data portability or export',
    description: 'The service allows users to export or download their data.',
    weight: 4,
    positive: [
      '\\b(export|download|port|transfer|request a copy|obtain a copy)\\b[\\s\\S]{0,60}\\b(data|information|content|your information)',
    ],
    enabled: true,
  },

  // Transparency — negative signals
  {
    id: 'transparency-changes',
    category: 'transparency',
    label: 'Changes without notice',
    description: 'The service can change terms without advance notice or retroactively.',
    weight: 7,
    negative: [
      '\\b(modify|change|update|revise|amend|alter)\\b[\\s\\S]{0,80}\\b(terms|agreement|policy|policies)\\b[\\s\\S]{0,60}\\b(at any time|without notice|effective immediately|upon posting|from time to time|in our sole discretion)',
      '\\b(without notice|without prior notice|effective immediately|upon posting)\\b[\\s\\S]{0,80}\\b(terms|agreement|policy)\\b',
    ],
    enabled: true,
  },
  {
    id: 'transparency-vague',
    category: 'transparency',
    label: 'Vague or broad language',
    description: 'The terms use vague phrases like "sole discretion" or broad catch-all language.',
    weight: 5,
    negative: [
      '\\b(in our sole discretion|as we see fit|including but not limited to|such other|from time to time|at our discretion|we may determine|in our judgment)\\b',
    ],
    enabled: true,
  },
  {
    id: 'transparency-hidden',
    category: 'transparency',
    label: 'Hidden or hard-to-find clauses',
    description: 'The terms mention clauses that are hidden, buried, or difficult to find.',
    weight: 4,
    negative: [
      '\\b(hidden|buried|obscure|difficult to find|fine print|inconspicuous|not readily accessible)\\b',
    ],
    enabled: true,
  },
  {
    id: 'transparency-plain',
    category: 'transparency',
    label: 'Plain and understandable language',
    description: 'The terms are written in plain language and aim to be understandable.',
    weight: 5,
    positive: [
      '\\b(plain language|plain[- ]English|clear language|understandable|readable|easy to understand|in simple terms|summarized)\\b',
    ],
    enabled: true,
  },
  {
    id: 'transparency-change-notice',
    category: 'transparency',
    label: 'Advance notice of changes',
    description: 'The service promises advance notice before terms changes take effect.',
    weight: 5,
    positive: [
      '\\b(advance notice|prior notice|notice before|notice of changes|email notice|notify you|will inform you)\\b[\\s\\S]{0,80}\\b(changes|modifications|updates|terms|policy)\\b',
    ],
    enabled: true,
  },
  {
    id: 'transparency-contact',
    category: 'transparency',
    label: 'Clear contact information',
    description: 'The terms provide clear contact or support information.',
    weight: 3,
    positive: [
      '\\b(contact us|support|customer service|email us|reach us|questions about|privacy@|support@|legal@)\\b',
    ],
    enabled: true,
  },

  // Freedom — negative signals
  {
    id: 'freedom-restrictions',
    category: 'freedom',
    label: 'Broad usage restrictions',
    description: 'The service imposes broad restrictions on reverse engineering, scraping, automation, or modification.',
    weight: 5,
    negative: [
      '\\b(you may not|you cannot|prohibited|forbidden|not allowed|restricted|must not)\\b[\\s\\S]{0,80}\\b(reverse engineer|decompile|disassemble|modify|distribute|copy|reproduce|scrape|crawl|automate|bot|spider|frame|mirror)\\b',
    ],
    enabled: true,
  },
  {
    id: 'freedom-liability',
    category: 'freedom',
    label: 'Broad liability waiver',
    description: 'The service limits or disclaims liability for damages broadly.',
    weight: 6,
    negative: [
      '\\b(limitation of liability|limit our liability|not liable|no liability|disclaim|disclaimer|not responsible|exclude liability|liability cap|maximum liability)\\b[\\s\\S]{0,80}\\b(damages|loss|losses|injury|harm|consequential|incidental|indirect|punitive)',
    ],
    enabled: true,
  },
  {
    id: 'freedom-indemnify',
    category: 'freedom',
    label: 'Indemnification requirement',
    description: 'The service requires users to indemnify or defend the company.',
    weight: 6,
    negative: [
      '\\b(indemnify|indemnification|hold harmless|defend|reimburse)\\b[\\s\\S]{0,40}\\b(us|company|service|provider|operator)\\b',
    ],
    enabled: true,
  },
  {
    id: 'freedom-lockin',
    category: 'freedom',
    label: 'Lock-in or cancellation difficulty',
    description: 'The terms include auto-renewal, cancellation fees, non-compete, or lock-in effects.',
    weight: 6,
    negative: [
      '\\b(non[- ]compete|non-competition|exclusivity|auto[- ]renew|automatic renewal|cancellation fee|early termination|lock[- ]in)\\b',
      '\\b(cancel|cancellation|terminate|termination)\\b[\\s\\S]{0,40}(?<!without\\s)\\b(fee|penalty|charge|non[- ]refundable)\\b',
    ],
    enabled: true,
  },
  {
    id: 'freedom-open',
    category: 'freedom',
    label: 'Open and interoperable',
    description: 'The terms mention open standards, portability, or interoperability.',
    weight: 4,
    positive: [
      '\\b(open source|source code available|open standards|interoperable|portable|data portability|api access|export your data)\\b',
    ],
    enabled: true,
  },
  {
    id: 'freedom-cancel',
    category: 'freedom',
    label: 'Easy cancellation',
    description: 'The service allows users to cancel or delete their account easily.',
    weight: 5,
    positive: [
      '\\b(cancel|cancellation|delete account|close account)\\b[\\s\\S]{0,60}\\b(at any time|easily|without penalty|free|no fee|no charge|any time)\\b',
      '\\b(you may cancel|you can cancel|you may delete|you can delete)\\b',
    ],
    enabled: true,
  },
  {
    id: 'freedom-fair-liability',
    category: 'freedom',
    label: 'Fair liability limits',
    description: 'The service does not exclude liability for gross negligence, fraud, or willful misconduct.',
    weight: 4,
    positive: [
      '\\b(not exclude|does not exclude|not limit|does not limit|gross negligence|willful misconduct|fraud|unlawful)\\b[\\s\\S]{0,60}\\b(liability|damages)\\b',
    ],
    enabled: true,
  },
];

export function scoreDocument(text: string, rules: ScoringRule[]): TermsScores {
  const normalized = text.toLowerCase();
  const scores: Record<ScoreCategory, { value: number; positives: string[]; negatives: string[] }> = {
    privacy: { value: 50, positives: [], negatives: [] },
    userRights: { value: 50, positives: [], negatives: [] },
    transparency: { value: 50, positives: [], negatives: [] },
    freedom: { value: 50, positives: [], negatives: [] },
  };

  for (const rule of rules) {
    if (!rule.enabled) continue;
    let matchedPositive = false;
    let matchedNegative = false;

    for (const pattern of rule.positive ?? []) {
      try {
        const re = new RegExp(pattern, 'i');
        if (re.test(normalized)) {
          matchedPositive = true;
          break;
        }
      } catch {
        // Ignore malformed custom regex.
      }
    }

    for (const pattern of rule.negative ?? []) {
      try {
        const re = new RegExp(pattern, 'i');
        if (re.test(normalized)) {
          matchedNegative = true;
          break;
        }
      } catch {
        // Ignore malformed custom regex.
      }
    }

    if (matchedPositive && !matchedNegative) {
      scores[rule.category].value += rule.weight;
      if (!scores[rule.category].positives.includes(rule.label)) {
        scores[rule.category].positives.push(rule.label);
      }
    } else if (matchedNegative && !matchedPositive) {
      scores[rule.category].value -= rule.weight;
      if (!scores[rule.category].negatives.includes(rule.label)) {
        scores[rule.category].negatives.push(rule.label);
      }
    } else if (matchedPositive && matchedNegative) {
      // Mixed signals: reduce net effect but still note both.
      const net = Math.max(0, rule.weight - 2);
      scores[rule.category].value += net;
      if (!scores[rule.category].positives.includes(rule.label)) {
        scores[rule.category].positives.push(rule.label);
      }
      if (!scores[rule.category].negatives.includes(rule.label)) {
        scores[rule.category].negatives.push(rule.label);
      }
    }
  }

  function buildSummary(data: { positives: string[]; negatives: string[] }): string {
    const topPos = data.positives.slice(0, 2);
    const topNeg = data.negatives.slice(0, 2);
    if (topPos.length === 0 && topNeg.length === 0) {
      return 'No strong signals detected in this category.';
    }
    const parts: string[] = [];
    if (topNeg.length > 0) parts.push(`Concerns: ${topNeg.join(', ')}.`);
    if (topPos.length > 0) parts.push(`Positives: ${topPos.join(', ')}.`);
    return parts.join(' ');
  }

  function toCategory(data: { value: number; positives: string[]; negatives: string[] }): CategoryScore {
    return {
      score: Math.max(0, Math.min(100, Math.round(data.value))),
      summary: buildSummary(data),
    };
  }

  return {
    privacy: toCategory(scores.privacy),
    userRights: toCategory(scores.userRights),
    transparency: toCategory(scores.transparency),
    freedom: toCategory(scores.freedom),
  };
}
