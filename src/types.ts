export type AvailabilityStatus =
  | 'Seeking Full-Time'
  | 'Internship / Co-op'
  | 'Open to Research'
  | 'Available Now';

export type InventionCategory =
  | 'Robotics'
  | 'CleanTech'
  | 'Assistive Tech'
  | 'Aerospace'
  | 'Embedded';

export type JobRoleType = 'Full-Time' | 'Internship' | 'Co-op' | 'Research Fellow';

export interface InventionSpec {
  label: string;
  value: string;
}

export interface DevelopmentLogEntry {
  id: string;
  date: string;
  title: string;
  notes: string;
  spendInr?: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  university: string;
  major: string;
  gradYear: number;
  location: string;
  availability: AvailabilityStatus;
  avatarUrl: string;
  bio: string;
  skills: string[];
  portfolioUrl?: string;
  githubUrl?: string;
  email: string;
  featuredAward?: string;
}

export interface Invention {
  id: string;
  studentId: string;
  title: string;
  category: InventionCategory;
  summary: string;
  videoUrl: string;
  posterUrl: string;
  galleryImages: string[];
  durationSeconds: number;
  stage: string;
  budgetInr: number;
  totalBudgetInr: number;
  bomCost: string;
  keyMetric: string;
  tools: string[];
  specifications: InventionSpec[];
  devLogs: DevelopmentLogEntry[];
  viewsCount: number;
  createdAt: string;
}

export interface EmployerInquiry {
  id: string;
  studentId: string;
  companyName: string;
  recruiterEmail: string;
  message: string;
  createdAt: string;
}

export interface JobOpening {
  id: string;
  title: string;
  company: string;
  location: string;
  roleType: JobRoleType;
  compensationMinInr: number;
  compensationMaxInr: number;
  compensationPeriod: 'year' | 'month';
  skillsRequired: string[];
  description: string;
  appliedStudentIds: string[];
  postedAt: string;
}

export interface InnovationChallenge {
  id: string;
  title: string;
  sponsorName: string;
  category: InventionCategory;
  prizePoolInr: number;
  grantPerTeamInr: number;
  deadline: string;
  brief: string;
  judgingCriteria: string[];
  enteredInventionIds: string[];
  createdAt: string;
}

export interface BootstrapPayload {
  students: StudentProfile[];
  inventions: Invention[];
  shortlistedIds: string[];
  inquiries: EmployerInquiry[];
  jobs: JobOpening[];
  challenges: InnovationChallenge[];
}
