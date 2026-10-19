import type { RawCandidateMessage, ConnectedAccount } from '../types';

/**
 * Generates 6 fresh, realistic candidate emails dynamically customized to the
 * authenticated recruiter's mailbox and company domain.
 */
export function generateConnectedInboxMessages(account: ConnectedAccount): RawCandidateMessage[] {
  const domain = account.email.split('@')[1] || 'company.com';
  const companyName = domain.split('.')[0]
    ? domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
    : 'our team';

  const now = new Date();
  const formatTime = (minutesAgo: number) =>
    new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();

  return [
    {
      id: `SYNC-${domain.slice(0, 4).toUpperCase()}-001`,
      sender_name: 'Maya Lin',
      sender_email: 'maya.lin.design@cloudportfolio.io',
      date_received: formatTime(18),
      subject: `Status update regarding Senior Product Designer role at ${companyName}`,
      applied_role: 'Senior Product Designer',
      stage: 'Post-Onsite Panel',
      body: `Hi ${account.email.split('@')[0] || 'Recruiting Team'},\n\nI hope your week is going great! I really enjoyed meeting the design and product leads during our virtual onsite loop last Thursday.\n\nI'm following up to see if there are any updates regarding next steps or timelines for feedback on the design system challenge. I'm very excited about ${companyName}'s product roadmap and would love the opportunity to contribute.\n\nBest regards,\nMaya Lin\nPortfolio: https://mayalin.design`,
    },
    {
      id: `SYNC-${domain.slice(0, 4).toUpperCase()}-002`,
      sender_name: 'Liam Gallagher',
      sender_email: 'liam.gallagher@inframesh.tech',
      date_received: formatTime(42),
      subject: 'Urgent: Reschedule technical screen tomorrow afternoon',
      applied_role: 'Lead Site Reliability Engineer',
      stage: 'Technical Screen',
      body: `Hello Talent Acquisition Team,\n\nI am currently scheduled for a 60-minute technical coding screen tomorrow, Wednesday at 2:00 PM EST.\n\nUnfortunately, an unexpected critical P0 outage on our Kubernetes clusters requires my direct on-call oversight all afternoon tomorrow. Would it be possible to reschedule our conversation to Thursday or Friday afternoon? I am fully free anytime after 1:00 PM EST on both days.\n\nI sincerely apologize for the short notice and appreciate your flexibility!\n\nThank you,\nLiam Gallagher`,
    },
    {
      id: `SYNC-${domain.slice(0, 4).toUpperCase()}-003`,
      sender_name: 'Sophia Chen',
      sender_email: 'sophia.chen@secureshield.org',
      date_received: formatTime(75),
      subject: `Compensation band and equity structure inquiry - Principal Cloud Architect`,
      applied_role: 'Principal Cloud Security Architect',
      stage: 'Hiring Manager Screen',
      body: `Dear ${companyName} Talent Team,\n\nThank you for inviting me to interview for the Principal Cloud Security Architect role. Before our upcoming conversation with the VP of Engineering, I wanted to clarify the approved base salary range for this level.\n\nCould you also share whether equity is granted as RSUs or ISO stock options, and the standard vesting schedule? Having this benchmark will ensure our mutual expectations are aligned as we move forward.\n\nWarm regards,\nSophia Chen`,
    },
    {
      id: `SYNC-${domain.slice(0, 4).toUpperCase()}-004`,
      sender_name: 'Carlos Mendez',
      sender_email: 'carlos.mendez.dev@codeworks.net',
      date_received: formatTime(110),
      subject: 'Application withdrawal - Senior Fullstack Engineer',
      applied_role: 'Senior Fullstack Engineer',
      stage: 'Offer Consideration',
      body: `Hi Recruiting Team,\n\nI am writing to let you know that I have decided to accept an offer with another company and would like to formally withdraw my application for the Senior Fullstack Engineer position at ${companyName}.\n\nI truly appreciated the opportunity to meet the engineering team. Everyone I spoke with was exceptionally professional, insightful, and welcoming. I hope our paths cross again in the future!\n\nBest of luck with filling the position.\n\nSincerely,\nCarlos Mendez`,
    },
    {
      id: `SYNC-${domain.slice(0, 4).toUpperCase()}-005`,
      sender_name: 'Rachel Vance',
      sender_email: 'rachel.vance@austinai.lab',
      date_received: formatTime(155),
      subject: 'Clarification regarding remote work policy and Austin hub',
      applied_role: 'AI/ML Research Scientist',
      stage: 'Application Review',
      body: `Good morning,\n\nI submitted my application for the AI/ML Research Scientist opening yesterday and had a quick question regarding the workplace policy.\n\nThe job posting lists San Francisco and Remote. Does ${companyName}'s policy permit researchers based in Austin, Texas to work 100% remotely, or are there required quarterly on-site syncs? Also, could you share what GPU cluster infrastructure the team primarily trains on?\n\nThank you for your time and guidance!\n\nBest,\nRachel Vance`,
    },
    {
      id: `SYNC-${domain.slice(0, 4).toUpperCase()}-006`,
      sender_name: 'Devon Reed',
      sender_email: 'devon.reed@datapipeline.io',
      date_received: formatTime(210),
      subject: 'Question on panel interview format and technical presentation',
      applied_role: 'Staff Data Platform Engineer',
      stage: 'Virtual Onsite Panel',
      body: `Hello Team,\n\nI received the confirmation for next Tuesday's virtual panel. Could you clarify whether the technical architecture presentation should focus primarily on real-time streaming pipelines or batch data modeling? Also, will I need to share my local IDE or use a shared browser sandbox?\n\nLooking forward to speaking with the data engineering leads!\n\nCheers,\nDevon Reed`,
    },
  ];
}
