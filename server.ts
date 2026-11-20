import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  AvailabilityStatus,
  BootstrapPayload,
  DevelopmentLogEntry,
  EmployerInquiry,
  InnovationChallenge,
  Invention,
  InventionCategory,
  InventionSpec,
  JobOpening,
  JobRoleType,
  StudentProfile,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const DB_PATH = path.join(DATA_DIR, 'db.json');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function formatInrString(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

const INITIAL_JOBS: JobOpening[] = [
  {
    id: 'job-ather-firmware',
    title: 'Embedded Firmware Engineer — Motor & BMS Control',
    company: 'Ather Energy Systems',
    location: 'Bengaluru, IN',
    roleType: 'Full-Time',
    compensationMinInr: 1200000,
    compensationMaxInr: 1650000,
    compensationPeriod: 'year',
    skillsRequired: ['STM32', 'Embedded C', 'CAN Bus', 'RTOS', 'KiCad'],
    description:
      'Own low-latency torque control loops and battery state-of-charge telemetry firmware on ARM Cortex-M7 automotive controllers.',
    appliedStudentIds: ['stu-marcus'],
    postedAt: '2026-11-10T09:00:00.000Z',
  },
  {
    id: 'job-pixxel-slam',
    title: 'Robotics Perception & SLAM Intern',
    company: 'Kinetix Autonomy Labs',
    location: 'Hyderabad, IN · Hybrid',
    roleType: 'Internship',
    compensationMinInr: 45000,
    compensationMaxInr: 60000,
    compensationPeriod: 'month',
    skillsRequired: ['ROS2', 'C++', 'LiDAR', 'PX4', 'Rust'],
    description:
      'Build and benchmark GPS-denied visual-inertial odometry pipelines for compact inspection drones flying in industrial tunnels.',
    appliedStudentIds: ['stu-dev'],
    postedAt: '2026-11-12T13:30:00.000Z',
  },
  {
    id: 'job-biodesign-mech',
    title: 'Mechatronics & Actuator Prototyping Engineer',
    company: 'Sattva MedTech',
    location: 'Chennai, IN',
    roleType: 'Full-Time',
    compensationMinInr: 950000,
    compensationMaxInr: 1350000,
    compensationPeriod: 'year',
    skillsRequired: ['SolidWorks', 'CNC Machining', 'Actuator Design', 'BLDC Micro-Servos'],
    description:
      'Design compliant miniature linkages, tendon drives, and DFM-ready anodized enclosures for clinical rehabilitation devices.',
    appliedStudentIds: [],
    postedAt: '2026-11-14T11:15:00.000Z',
  },
];

const INITIAL_CHALLENGES: InnovationChallenge[] = [
  {
    id: 'chal-coldchain',
    title: 'Ultra-Low-Power Agri Cold-Chain Telemetry Challenge',
    sponsorName: 'Sahyadri AgriVentures',
    category: 'CleanTech',
    prizePoolInr: 500000,
    grantPerTeamInr: 40000,
    deadline: '2026-12-22',
    brief:
      'Build an autonomous solar or long-life battery sensor node under ₹6,500 unit BOM that logs humidity, ethylene, and temperature across rural produce crates.',
    judgingCriteria: [
      'Sub-₹6,500 BOM scalability',
      '90-day field battery endurance',
      'LoRa/NB-IoT packet reliability',
    ],
    enteredInventionIds: ['inv-water'],
    createdAt: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 'chal-assistive',
    title: 'Affordable Clinical Assistive Hardware Sprint',
    sponsorName: 'Narayana Biodesign Foundation',
    category: 'Assistive Tech',
    prizePoolInr: 350000,
    grantPerTeamInr: 35000,
    deadline: '2027-01-15',
    brief:
      'Showcase working prosthetics, tactile reading aids, or mobility actuators designed for Indian clinics at a target manufacturing BOM under ₹28,000.',
    judgingCriteria: [
      'Ergonomic comfort & safety',
      'Repairability with local parts',
      'Bench validation video proof',
    ],
    enteredInventionIds: ['inv-prosthetic', 'inv-braille'],
    createdAt: '2026-11-05T15:00:00.000Z',
  },
  {
    id: 'chal-indoor-uav',
    title: 'GPS-Denied Sub-1kg Disaster Mapping Drone',
    sponsorName: 'Garuda Autonomous Systems',
    category: 'Aerospace',
    prizePoolInr: 650000,
    grantPerTeamInr: 60000,
    deadline: '2027-02-05',
    brief:
      'Demonstrate autonomous obstacle-avoiding flight and real-time 3D mapping inside unlit indoor structures using onboard compute.',
    judgingCriteria: [
      'Odometry drift < 5 cm/min',
      'Sub-1 kg all-up mass',
      'Live point-cloud demo',
    ],
    enteredInventionIds: ['inv-drone'],
    createdAt: '2026-11-09T08:30:00.000Z',
  },
];

const INITIAL_DB: BootstrapPayload = {
  students: [
    {
      id: 'stu-maya',
      name: 'Maya Chen',
      university: 'IIT Bombay (Exchange Fellow)',
      major: 'Mechanical & Robotics Engineering',
      gradYear: 2026,
      location: 'Mumbai, IN',
      availability: 'Seeking Full-Time',
      avatarUrl: '/src/assets/images/student_maya_chen_1794884426318.jpg',
      bio: 'Designing tendon-driven robotic actuators and low-latency EMG signal processing pipelines for affordable clinical prosthetics.',
      skills: ['ROS2', 'C++', 'SolidWorks', 'Custom PCB', 'EMG Signal Processing', 'Carbon Layup'],
      githubUrl: 'https://github.com/mayachen-robotics',
      portfolioUrl: 'https://mayachen.design',
      email: 'maya.chen@robotics.edu',
      featuredAward: 'James Dyson Award National Finalist 2026',
    },
    {
      id: 'stu-marcus',
      name: 'Marcus Okafor',
      university: 'IIT Madras',
      major: 'Environmental & Electrical Engineering',
      gradYear: 2026,
      location: 'Chennai, IN',
      availability: 'Internship / Co-op',
      avatarUrl: '/src/assets/images/student_marcus_okafor_1794884426470.jpg',
      bio: 'Building ultra-low-power field sensing nodes and LoRaWAN telemetry networks for municipal watershed monitoring.',
      skills: ['STM32', 'Embedded C', 'LoRaWAN', 'Solar MPPT', 'KiCad', 'Waterproofing'],
      githubUrl: 'https://github.com/mokafor-hw',
      email: 'm.okafor@ee.iitm.ac.in',
      featuredAward: 'CleanTech Hardware Student Fellow',
    },
    {
      id: 'stu-elena',
      name: 'Priya Nair',
      university: 'IISc Bengaluru',
      major: 'Product Design & Mechatronics',
      gradYear: 2027,
      location: 'Bengaluru, IN',
      availability: 'Internship / Co-op',
      avatarUrl: '/src/assets/images/student_elena_rostova_1794884427833.jpg',
      bio: 'Focused on compliant mechanisms and magnetic latching actuators that cut the manufacturing cost of tactile assistive hardware.',
      skills: ['Mechatronics', 'CNC Machining', 'Python', 'Fusion 360', 'Actuator Design', 'Haptics'],
      portfolioUrl: 'https://priyanair.studio',
      email: 'priya.nair@iisc.ac.in',
      featuredAward: 'National Assistive Biodesign Winner',
    },
    {
      id: 'stu-dev',
      name: 'Dev Patel',
      university: 'IIIT Hyderabad',
      major: 'Robotics & Embedded Systems',
      gradYear: 2026,
      location: 'Hyderabad, IN',
      availability: 'Available Now',
      avatarUrl: '/src/assets/images/student_dev_patel_1794884427434.jpg',
      bio: 'Developing GPS-denied SLAM navigation stacks and lightweight LiDAR payloads for indoor first-responder micro-drones.',
      skills: ['PX4', 'SLAM', 'LiDAR', 'Rust', 'C++', 'Flight Control', 'FPGA'],
      githubUrl: 'https://github.com/devpatel-uav',
      email: 'dev.patel@research.iiit.ac.in',
      featuredAward: 'IROS Best Student Hardware Demo',
    },
  ],
  inventions: [
    {
      id: 'inv-prosthetic',
      studentId: 'stu-maya',
      title: 'KinetiGrip Carbon Myoelectric Hand',
      category: 'Robotics',
      summary:
        'A 5-finger tendon-actuated prosthetic hand weighing 340g with 42 ms surface-EMG grip classification and modular quick-swap finger cartridges.',
      videoUrl: '/uploads/demo_prosthetic.mp4',
      posterUrl: '/src/assets/images/invention_prosthetic_hand_1794884424777.jpg',
      galleryImages: [
        '/src/assets/images/invention_prosthetic_hand_1794884424777.jpg',
        '/src/assets/images/detail_prosthetic_pcb_1794885063970.jpg',
      ],
      durationSeconds: 6,
      stage: 'Clinical Pilot Prototype',
      budgetInr: 25800,
      totalBudgetInr: 42500,
      bomCost: '₹25,800 BOM',
      keyMetric: '42 ms EMG latency',
      tools: ['C++', 'STM32H7', 'Carbon Fiber', 'BLDC Micro-Servos'],
      specifications: [
        { label: 'Total Mass', value: '340 g (excluding socket)' },
        { label: 'Control Loop MCU', value: 'STM32H743 @ 480 MHz' },
        { label: 'EMG Sampling Rate', value: '2 kHz dual-channel differential' },
        { label: 'Pinch Grip Force', value: '18.5 N sustained' },
        { label: 'Battery Endurance', value: '14 hours (2S LiPo 1800 mAh)' },
      ],
      devLogs: [
        {
          id: 'log-prosthetic-1',
          date: '2026-09-14',
          title: 'Rev A braided Dyneema tendon routing',
          notes:
            'Replaced steel bowden cables with 0.8 mm UHMWPE braided lines to cut pulley friction by 38% and eliminate backlash in index flexion.',
          spendInr: 8400,
        },
        {
          id: 'log-prosthetic-2',
          date: '2026-10-11',
          title: 'Rev B 4-layer EMG analog front-end PCB',
          notes:
            'Added active 50 Hz notch filtering and driven right-leg common-mode rejection; reduced false grip triggers under fluorescent lab lighting.',
          spendInr: 11200,
        },
        {
          id: 'log-prosthetic-3',
          date: '2026-10-28',
          title: 'Carbon-nylon shell layup & clinical grasp trials',
          notes:
            'Completed 200-cycle pick-and-place bench validation across cylindrical, pinch, and tripod grasps with 42 ms end-to-end latency.',
          spendInr: 6200,
        },
      ],
      viewsCount: 418,
      createdAt: '2026-10-28T14:20:00.000Z',
    },
    {
      id: 'inv-water',
      studentId: 'stu-marcus',
      title: 'AquaNet Solar Turbidity Buoy',
      category: 'CleanTech',
      summary:
        'Self-powered autonomous stream monitor measuring turbidity, dissolved oxygen, and conductivity every 15 minutes over a 12 km LoRa mesh link.',
      videoUrl: '/uploads/demo_water.mp4',
      posterUrl: '/src/assets/images/invention_water_sensor_1794884425277.jpg',
      galleryImages: [
        '/src/assets/images/invention_water_sensor_1794884425277.jpg',
        '/src/assets/images/detail_water_field_1794885064071.jpg',
      ],
      durationSeconds: 6,
      stage: 'Field Tested',
      budgetInr: 12200,
      totalBudgetInr: 19500,
      bomCost: '₹12,200 BOM',
      keyMetric: '14-month autonomous runtime',
      tools: ['Embedded C', 'LoRaWAN', 'KiCad', 'Optical Spectroscopy'],
      specifications: [
        { label: 'Enclosure Rating', value: 'IP68 Anodized 6061 Aluminum' },
        { label: 'Solar Array', value: '6W Monocrystalline + MPPT' },
        { label: 'Telemetry Link', value: 'SX1262 LoRa 865 MHz (12 km LOS)' },
        { label: 'Turbidity Range', value: '0.5 to 1,000 NTU (±2%)' },
        { label: 'Sleep Current', value: '18 µA deep-sleep draw' },
      ],
      devLogs: [
        {
          id: 'log-water-1',
          date: '2026-09-22',
          title: '90-degree nephelometric optical chamber calibration',
          notes:
            'Machined Delrin baffle around 850 nm IR LED and photodiode to reject ambient sunlight interference in shallow streams.',
          spendInr: 5400,
        },
        {
          id: 'log-water-2',
          date: '2026-11-02',
          title: '72-hour continuous stream immersion test',
          notes:
            'Deployed anchored buoy in flowing tributary; zero gasket ingress and 99.4% packet delivery across 3 km tree canopy.',
          spendInr: 6800,
        },
      ],
      viewsCount: 289,
      createdAt: '2026-11-02T09:15:00.000Z',
    },
    {
      id: 'inv-braille',
      studentId: 'stu-elena',
      title: 'TactileGrid Multi-Line Braille Slate',
      category: 'Assistive Tech',
      summary:
        'Uses bistable magnetic pin latches instead of costly piezo stacks to render four simultaneous lines of refreshable Braille at under ₹18,000 per unit.',
      videoUrl: '/uploads/demo_braille.mp4',
      posterUrl: '/src/assets/images/invention_braille_tablet_1794884426095.jpg',
      galleryImages: [
        '/src/assets/images/invention_braille_tablet_1794884426095.jpg',
        '/src/assets/images/detail_braille_actuators_1794885064221.jpg',
      ],
      durationSeconds: 6,
      stage: 'Functional Prototype',
      budgetInr: 17900,
      totalBudgetInr: 28400,
      bomCost: '₹17,900 BOM',
      keyMetric: '4x24 tactile pin matrix',
      tools: ['CNC Aluminum', 'Python', 'PCB Coils', 'BLE'],
      specifications: [
        { label: 'Active Display', value: '4 lines × 24 cells (576 pins)' },
        { label: 'Pin Pitch', value: '2.5 mm ISO standard spacing' },
        { label: 'Refresh Speed', value: '120 ms full-page latch' },
        { label: 'Holding Power', value: '0 mW (bistable NdFeB latch)' },
        { label: 'Host Interface', value: 'USB-C HID & Bluetooth LE 5.3' },
      ],
      devLogs: [
        {
          id: 'log-braille-1',
          date: '2026-10-03',
          title: 'Planar PCB micro-coil winding optimization',
          notes:
            'Switched to 6-layer 2 oz copper coils driven with 14 ms bipolar current pulses to snap pins without thermal buildup.',
          spendInr: 9600,
        },
        {
          id: 'log-braille-2',
          date: '2026-11-08',
          title: 'CNC housing & rotary scroll encoder integration',
          notes:
            'Milled top plate to ±0.03 mm pin bore tolerance; tested EPUB-to-Braille parser with 6 local accessibility students.',
          spendInr: 8300,
        },
      ],
      viewsCount: 512,
      createdAt: '2026-11-08T18:05:00.000Z',
    },
    {
      id: 'inv-drone',
      studentId: 'stu-dev',
      title: 'SAR-Q Foldable Indoor LiDAR Drone',
      category: 'Aerospace',
      summary:
        'Sub-900g autonomous quadcopter running onboard 3D SLAM without GPS, built to map collapsed stairwells and smoke-filled interiors.',
      videoUrl: '/uploads/demo_drone.mp4',
      posterUrl: '/src/assets/images/invention_drone_lidar_1794884427440.jpg',
      galleryImages: [
        '/src/assets/images/invention_drone_lidar_1794884427440.jpg',
        '/src/assets/images/detail_drone_telemetry_1794885064790.jpg',
      ],
      durationSeconds: 6,
      stage: 'Flight Verified',
      budgetInr: 64500,
      totalBudgetInr: 92000,
      bomCost: '₹64,500 BOM',
      keyMetric: '2.1 cm indoor drift/min',
      tools: ['ROS2', 'PX4', 'Rust', 'Velodyne LiDAR'],
      specifications: [
        { label: 'All-Up Weight', value: '885 g with 4S 3000 mAh pack' },
        { label: 'Folded Footprint', value: '210 × 140 × 85 mm' },
        { label: 'Compute Module', value: 'Jetson Orin Nano + Pixhawk 6C' },
        { label: 'Flight Endurance', value: '17 minutes hover in cage' },
        { label: 'SLAM Odometry Rate', value: '40 Hz FAST-LIO2 in Rust/C++' },
      ],
      devLogs: [
        {
          id: 'log-drone-1',
          date: '2026-10-19',
          title: 'Carbon arm hinge stiffness & vibration isolation',
          notes:
            'Added 40A silicone IMU grommets and locking detent latches on folding arms, cutting gyro high-frequency noise by 62%.',
          spendInr: 22500,
        },
        {
          id: 'log-drone-2',
          date: '2026-11-12',
          title: 'GPS-denied corridor loop closure flight test',
          notes:
            'Completed autonomous figure-8 traversal inside flight cage with 2.1 cm/min odometry drift and real-time point-cloud streaming.',
          spendInr: 42000,
        },
      ],
      viewsCount: 364,
      createdAt: '2026-11-12T11:40:00.000Z',
    },
  ],
  shortlistedIds: ['stu-maya'],
  inquiries: [],
  jobs: INITIAL_JOBS,
  challenges: INITIAL_CHALLENGES,
};

function migrateInvention(inv: Invention): Invention {
  const seedMatch = INITIAL_DB.inventions.find((s) => s.id === inv.id);

  let budgetInr = Number(inv.budgetInr);
  if (!Number.isFinite(budgetInr) || budgetInr <= 0) {
    if (seedMatch) {
      budgetInr = seedMatch.budgetInr;
    } else {
      const digits = Number(String(inv.bomCost || '').replace(/[^0-9]/g, ''));
      budgetInr = digits > 0 ? (String(inv.bomCost).includes('$') ? digits * 84 : digits) : 15000;
    }
  }

  let totalBudgetInr = Number(inv.totalBudgetInr);
  if (!Number.isFinite(totalBudgetInr) || totalBudgetInr <= 0) {
    totalBudgetInr = seedMatch ? seedMatch.totalBudgetInr : Math.round(budgetInr * 1.35);
  }

  const bomCost = `${formatInrString(budgetInr)} BOM`;

  const galleryImages =
    Array.isArray(inv.galleryImages) && inv.galleryImages.length > 0
      ? inv.galleryImages
      : seedMatch?.galleryImages || (inv.posterUrl ? [inv.posterUrl] : []);

  const specifications =
    Array.isArray(inv.specifications) && inv.specifications.length > 0
      ? inv.specifications
      : seedMatch?.specifications || [
          { label: 'Prototype Stage', value: inv.stage || 'Working Prototype' },
          { label: 'Primary Metric', value: inv.keyMetric || 'Bench Verified' },
        ];

  const devLogs =
    Array.isArray(inv.devLogs) && inv.devLogs.length > 0
      ? inv.devLogs
      : seedMatch?.devLogs || [
          {
            id: `log-${inv.id}-init`,
            date: (inv.createdAt || new Date().toISOString()).slice(0, 10),
            title: 'Initial prototype build & bench demo',
            notes: inv.summary,
            spendInr: budgetInr,
          },
        ];

  return {
    ...inv,
    budgetInr,
    totalBudgetInr,
    bomCost,
    galleryImages,
    specifications,
    devLogs,
  };
}

function readDb(): BootstrapPayload {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2));
      return structuredClone(INITIAL_DB);
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<BootstrapPayload> & {
      recruiterSubscription?: unknown;
    };
    const rawInventions = Array.isArray(parsed.inventions) ? parsed.inventions : INITIAL_DB.inventions;
    const migratedInventions = rawInventions.map(migrateInvention);

    const payload: BootstrapPayload = {
      students: Array.isArray(parsed.students) ? parsed.students : INITIAL_DB.students,
      inventions: migratedInventions,
      shortlistedIds: Array.isArray(parsed.shortlistedIds) ? parsed.shortlistedIds : [],
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
      jobs: Array.isArray(parsed.jobs) && parsed.jobs.length > 0 ? parsed.jobs : INITIAL_JOBS,
      challenges:
        Array.isArray(parsed.challenges) && parsed.challenges.length > 0
          ? parsed.challenges
          : INITIAL_CHALLENGES,
    };

    if (
      parsed.recruiterSubscription !== undefined ||
      !parsed.jobs ||
      !parsed.challenges ||
      JSON.stringify(rawInventions) !== JSON.stringify(migratedInventions)
    ) {
      fs.writeFileSync(DB_PATH, JSON.stringify(payload, null, 2));
    }

    return payload;
  } catch {
    fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2));
    return structuredClone(INITIAL_DB);
  }
}

function writeDb(data: BootstrapPayload): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function sanitizeFilename(input: string, fallbackExt: string): string {
  const ext = path.extname(input || '').toLowerCase().replace(/[^a-z0-9.]/g, '') || fallbackExt;
  const base =
    path
      .basename(input || 'upload', path.extname(input || ''))
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .slice(0, 40) || 'clip';
  return `${Date.now()}-${base}${ext}`;
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  readDb();

  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      acceptRanges: true,
      maxAge: '1d',
    })
  );

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/bootstrap', (_req, res) => {
    res.json(readDb());
  });

  app.post(
    '/api/videos/upload',
    express.raw({ type: '*/*', limit: '120mb' }),
    (req, res) => {
      try {
        const buffer = req.body as Buffer;
        if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
          res.status(400).json({ error: 'Empty video file received.' });
          return;
        }
        const rawName = String(req.headers['x-filename'] || 'demo.mp4');
        const contentType = String(req.headers['content-type'] || 'video/mp4');
        const extMap: Record<string, string> = {
          'video/mp4': '.mp4',
          'video/webm': '.webm',
          'video/quicktime': '.mov',
          'video/ogg': '.ogv',
        };
        const fallbackExt = extMap[contentType.split(';')[0].trim()] || '.mp4';
        const filename = sanitizeFilename(rawName, fallbackExt);
        const dest = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(dest, buffer);
        res.status(201).json({ url: `/uploads/${filename}`, sizeBytes: buffer.length });
      } catch (err) {
        console.error('Video upload error:', err);
        res.status(500).json({ error: 'Failed to store uploaded video.' });
      }
    }
  );

  app.post(
    '/api/images/upload',
    express.raw({ type: '*/*', limit: '15mb' }),
    (req, res) => {
      try {
        const buffer = req.body as Buffer;
        if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
          res.status(400).json({ error: 'Empty image file received.' });
          return;
        }
        const rawName = String(req.headers['x-filename'] || 'poster.jpg');
        const contentType = String(req.headers['content-type'] || 'image/jpeg');
        const extMap: Record<string, string> = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/webp': '.webp',
        };
        const fallbackExt = extMap[contentType.split(';')[0].trim()] || '.jpg';
        const filename = sanitizeFilename(rawName, fallbackExt);
        const dest = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(dest, buffer);
        res.status(201).json({ url: `/uploads/${filename}` });
      } catch (err) {
        console.error('Image upload error:', err);
        res.status(500).json({ error: 'Failed to store uploaded image.' });
      }
    }
  );

  app.use(express.json({ limit: '2mb' }));

  // Student Profile endpoints (open & free)
  app.post('/api/students', (req, res) => {
    const body = req.body as Partial<StudentProfile>;
    if (!body.name?.trim() || !body.university?.trim() || !body.major?.trim() || !body.email?.trim()) {
      res.status(400).json({ error: 'Name, university, major, and email are required.' });
      return;
    }

    const db = readDb();
    const student: StudentProfile = {
      id: `stu-${Date.now()}`,
      name: body.name.trim(),
      university: body.university.trim(),
      major: body.major.trim(),
      gradYear: Number(body.gradYear) || 2026,
      location: body.location?.trim() || 'Remote / Campus',
      availability: (body.availability as AvailabilityStatus) || 'Seeking Full-Time',
      avatarUrl:
        body.avatarUrl?.trim() || '/src/assets/images/student_maya_chen_1794884426318.jpg',
      bio: body.bio?.trim() || 'Student inventor building functional hardware and software prototypes.',
      skills: Array.isArray(body.skills) && body.skills.length > 0 ? body.skills : ['Prototyping'],
      githubUrl: body.githubUrl?.trim() || undefined,
      portfolioUrl: body.portfolioUrl?.trim() || undefined,
      email: body.email.trim(),
      featuredAward: body.featuredAward?.trim() || undefined,
    };

    db.students.unshift(student);
    writeDb(db);
    res.status(201).json(student);
  });

  app.put('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const body = req.body as Partial<StudentProfile>;
    const db = readDb();
    const idx = db.students.findIndex((s) => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const current = db.students[idx];
    const updated: StudentProfile = {
      ...current,
      name: body.name?.trim() || current.name,
      university: body.university?.trim() || current.university,
      major: body.major?.trim() || current.major,
      gradYear: Number(body.gradYear) || current.gradYear,
      location: body.location?.trim() || current.location,
      availability: (body.availability as AvailabilityStatus) || current.availability,
      avatarUrl: body.avatarUrl?.trim() || current.avatarUrl,
      bio: body.bio?.trim() || current.bio,
      skills: Array.isArray(body.skills) ? body.skills : current.skills,
      githubUrl: body.githubUrl !== undefined ? body.githubUrl.trim() || undefined : current.githubUrl,
      portfolioUrl:
        body.portfolioUrl !== undefined ? body.portfolioUrl.trim() || undefined : current.portfolioUrl,
      email: body.email?.trim() || current.email,
      featuredAward:
        body.featuredAward !== undefined ? body.featuredAward.trim() || undefined : current.featuredAward,
    };

    db.students[idx] = updated;
    writeDb(db);
    res.json(updated);
  });

  // Inventions endpoints
  app.post('/api/inventions', (req, res) => {
    const body = req.body as Partial<Invention>;
    if (!body.studentId || !body.title?.trim() || !body.summary?.trim() || !body.videoUrl?.trim()) {
      res.status(400).json({ error: 'Student, title, summary, and demo video are required.' });
      return;
    }

    const db = readDb();
    const studentExists = db.students.some((s) => s.id === body.studentId);
    if (!studentExists) {
      res.status(404).json({ error: 'Selected student profile does not exist.' });
      return;
    }

    const budgetInr = Math.max(0, Math.round(Number(body.budgetInr) || 12000));
    const totalBudgetInr = Math.max(
      budgetInr,
      Math.round(Number(body.totalBudgetInr) || Math.round(budgetInr * 1.25))
    );
    const posterUrl =
      body.posterUrl?.trim() || '/src/assets/images/invention_prosthetic_hand_1794884424777.jpg';
    const galleryImages =
      Array.isArray(body.galleryImages) && body.galleryImages.length > 0
        ? body.galleryImages
        : [posterUrl];
    const specifications: InventionSpec[] = Array.isArray(body.specifications)
      ? body.specifications.filter((s) => s?.label?.trim() && s?.value?.trim())
      : [];
    const devLogs: DevelopmentLogEntry[] = Array.isArray(body.devLogs)
      ? body.devLogs.filter((l) => l?.title?.trim() && l?.notes?.trim())
      : [];

    const invention: Invention = {
      id: `inv-${Date.now()}`,
      studentId: body.studentId,
      title: body.title.trim(),
      category: (body.category as InventionCategory) || 'Robotics',
      summary: body.summary.trim(),
      videoUrl: body.videoUrl.trim(),
      posterUrl,
      galleryImages,
      durationSeconds: Math.max(1, Math.round(Number(body.durationSeconds) || 12)),
      stage: body.stage?.trim() || 'Working Prototype',
      budgetInr,
      totalBudgetInr,
      bomCost: `${formatInrString(budgetInr)} BOM`,
      keyMetric: body.keyMetric?.trim() || 'Bench Verified',
      tools: Array.isArray(body.tools) && body.tools.length > 0 ? body.tools : ['Hardware Prototype'],
      specifications:
        specifications.length > 0
          ? specifications
          : [
              { label: 'Prototype Stage', value: body.stage?.trim() || 'Working Prototype' },
              { label: 'Key Benchmark', value: body.keyMetric?.trim() || 'Bench Verified' },
            ],
      devLogs:
        devLogs.length > 0
          ? devLogs
          : [
              {
                id: `log-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                title: 'Initial prototype demonstration',
                notes: body.summary.trim(),
                spendInr: budgetInr,
              },
            ],
      viewsCount: 1,
      createdAt: new Date().toISOString(),
    };

    db.inventions.unshift(invention);
    writeDb(db);
    res.status(201).json(invention);
  });

  app.put('/api/inventions/:id', (req, res) => {
    const { id } = req.params;
    const body = req.body as Partial<Invention>;
    const db = readDb();
    const idx = db.inventions.findIndex((item) => item.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Invention not found.' });
      return;
    }

    const current = db.inventions[idx];
    const budgetInr =
      body.budgetInr !== undefined
        ? Math.max(0, Math.round(Number(body.budgetInr) || 0))
        : current.budgetInr;
    const totalBudgetInr =
      body.totalBudgetInr !== undefined
        ? Math.max(budgetInr, Math.round(Number(body.totalBudgetInr) || 0))
        : current.totalBudgetInr;

    const updated: Invention = {
      ...current,
      title: body.title?.trim() || current.title,
      category: (body.category as InventionCategory) || current.category,
      summary: body.summary?.trim() || current.summary,
      stage: body.stage?.trim() || current.stage,
      keyMetric: body.keyMetric?.trim() || current.keyMetric,
      budgetInr,
      totalBudgetInr,
      bomCost: `${formatInrString(budgetInr)} BOM`,
      tools: Array.isArray(body.tools) ? body.tools : current.tools,
      galleryImages: Array.isArray(body.galleryImages)
        ? body.galleryImages
        : current.galleryImages,
      posterUrl:
        Array.isArray(body.galleryImages) && body.galleryImages.length > 0
          ? body.galleryImages[0]
          : current.posterUrl,
      specifications: Array.isArray(body.specifications)
        ? body.specifications.filter((s) => s?.label?.trim() && s?.value?.trim())
        : current.specifications,
      devLogs: Array.isArray(body.devLogs)
        ? body.devLogs.filter((l) => l?.title?.trim() && l?.notes?.trim())
        : current.devLogs,
    };

    db.inventions[idx] = updated;
    writeDb(db);
    res.json(updated);
  });

  app.post('/api/inventions/:id/view', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const inv = db.inventions.find((item) => item.id === id);
    if (!inv) {
      res.status(404).json({ error: 'Invention not found.' });
      return;
    }
    inv.viewsCount += 1;
    writeDb(db);
    res.json({ viewsCount: inv.viewsCount });
  });

  app.post('/api/shortlist/toggle', (req, res) => {
    const { studentId } = req.body as { studentId?: string };
    if (!studentId) {
      res.status(400).json({ error: 'studentId is required.' });
      return;
    }
    const db = readDb();
    const exists = db.shortlistedIds.includes(studentId);
    db.shortlistedIds = exists
      ? db.shortlistedIds.filter((id) => id !== studentId)
      : [...db.shortlistedIds, studentId];
    writeDb(db);
    res.json({ shortlistedIds: db.shortlistedIds, shortlisted: !exists });
  });

  app.post('/api/inquiries', (req, res) => {
    const db = readDb();
    const { studentId, companyName, recruiterEmail, message } = req.body as Partial<EmployerInquiry>;
    if (!studentId || !companyName?.trim() || !recruiterEmail?.trim() || !message?.trim()) {
      res.status(400).json({ error: 'Company, email, and message are required.' });
      return;
    }
    const inquiry: EmployerInquiry = {
      id: `inq-${Date.now()}`,
      studentId,
      companyName: companyName.trim(),
      recruiterEmail: recruiterEmail.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };
    db.inquiries.unshift(inquiry);
    writeDb(db);
    res.status(201).json(inquiry);
  });

  // Job Board endpoints
  app.post('/api/jobs', (req, res) => {
    const body = req.body as Partial<JobOpening>;
    if (!body.title?.trim() || !body.company?.trim() || !body.description?.trim()) {
      res.status(400).json({ error: 'Job title, company name, and description are required.' });
      return;
    }

    const minInr = Math.max(0, Math.round(Number(body.compensationMinInr) || 40000));
    const maxInr = Math.max(minInr, Math.round(Number(body.compensationMaxInr) || minInr));
    const job: JobOpening = {
      id: `job-${Date.now()}`,
      title: body.title.trim(),
      company: body.company.trim(),
      location: body.location?.trim() || 'Bengaluru, IN',
      roleType: (body.roleType as JobRoleType) || 'Full-Time',
      compensationMinInr: minInr,
      compensationMaxInr: maxInr,
      compensationPeriod: body.compensationPeriod === 'month' ? 'month' : 'year',
      skillsRequired:
        Array.isArray(body.skillsRequired) && body.skillsRequired.length > 0
          ? body.skillsRequired
          : ['Hardware Engineering'],
      description: body.description.trim(),
      appliedStudentIds: [],
      postedAt: new Date().toISOString(),
    };

    const db = readDb();
    db.jobs.unshift(job);
    writeDb(db);
    res.status(201).json(job);
  });

  app.post('/api/jobs/:id/apply', (req, res) => {
    const { id } = req.params;
    const { studentId } = req.body as { studentId?: string };
    if (!studentId) {
      res.status(400).json({ error: 'studentId is required to apply.' });
      return;
    }
    const db = readDb();
    const job = db.jobs.find((j) => j.id === id);
    if (!job) {
      res.status(404).json({ error: 'Job opening not found.' });
      return;
    }
    if (!job.appliedStudentIds.includes(studentId)) {
      job.appliedStudentIds.push(studentId);
      writeDb(db);
    }
    res.json(job);
  });

  // Sponsored Innovation Challenges endpoints
  app.post('/api/challenges', (req, res) => {
    const body = req.body as Partial<InnovationChallenge>;
    if (!body.title?.trim() || !body.sponsorName?.trim() || !body.brief?.trim()) {
      res.status(400).json({ error: 'Challenge title, sponsor name, and brief are required.' });
      return;
    }

    const challenge: InnovationChallenge = {
      id: `chal-${Date.now()}`,
      title: body.title.trim(),
      sponsorName: body.sponsorName.trim(),
      category: (body.category as InventionCategory) || 'Robotics',
      prizePoolInr: Math.max(25000, Math.round(Number(body.prizePoolInr) || 300000)),
      grantPerTeamInr: Math.max(0, Math.round(Number(body.grantPerTeamInr) || 35000)),
      deadline: body.deadline?.trim() || '2027-01-30',
      brief: body.brief.trim(),
      judgingCriteria:
        Array.isArray(body.judgingCriteria) && body.judgingCriteria.length > 0
          ? body.judgingCriteria
          : ['Working prototype demo', 'BOM cost efficiency in ₹'],
      enteredInventionIds: [],
      createdAt: new Date().toISOString(),
    };

    const db = readDb();
    db.challenges.unshift(challenge);
    writeDb(db);
    res.status(201).json(challenge);
  });

  app.post('/api/challenges/:id/enter', (req, res) => {
    const { id } = req.params;
    const { inventionId } = req.body as { inventionId?: string };
    if (!inventionId) {
      res.status(400).json({ error: 'Please select an invention demo to submit.' });
      return;
    }
    const db = readDb();
    const challenge = db.challenges.find((c) => c.id === id);
    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found.' });
      return;
    }
    if (!db.inventions.some((inv) => inv.id === inventionId)) {
      res.status(404).json({ error: 'Selected invention does not exist.' });
      return;
    }
    if (!challenge.enteredInventionIds.includes(inventionId)) {
      challenge.enteredInventionIds.unshift(inventionId);
      writeDb(db);
    }
    res.json(challenge);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ProtoReel server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
