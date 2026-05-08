import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding FUDMA Knowledge Base...");

  // 1. Clear existing data
  await prisma.conversation.deleteMany();
  await prisma.session.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.academicInfo.deleteMany();
  await prisma.department.deleteMany();

  // 2. Departments
  const departments = [
    {
      name: "Computer Science",
      faculty: "Computing",
      hodName: "Dr. Ahmed Bello",
      hodContact: "cs.hod@fudma.edu.ng",
      officeLocation: "Computing Complex, Floor 1, Room 102",
    },
    {
      name: "Biological Sciences",
      faculty: "Life Sciences",
      hodName: "Prof. Sarah Musa",
      hodContact: "bio.hod@fudma.edu.ng",
      officeLocation: "Sciences Wing B, Ground Floor",
    },
    {
      name: "Economics",
      faculty: "Social Sciences",
      hodName: "Dr. Ibrahim Kaita",
      hodContact: "econ.hod@fudma.edu.ng",
      officeLocation: "Social Sciences Block, Room 205",
    },
    {
      name: "English and Literary Studies",
      faculty: "Arts",
      hodName: "Dr. Maryam Usman",
      hodContact: "english.hod@fudma.edu.ng",
      officeLocation: "Humanities Building, Floor 2",
    },
  ];

  for (const dept of departments) {
    await prisma.department.create({ data: dept });
  }

  // 3. FAQs
  const faqs = [
    // English
    {
      question: "How do I register for courses?",
      answer: "Log in to the student portal, navigate to the registration tab, select your courses for the semester, and click submit for advisor approval.",
      category: "Academics",
      language: "english",
    },
    {
      question: "What are the requirements for new students?",
      answer: "New students need their JAMB admission letter, O-level results, birth certificate, and proof of state of origin for physical screening.",
      category: "Admission",
      language: "english",
    },
    {
      question: "Where is the University Library located?",
      answer: "The Main Library is located at the center of the campus, adjacent to the Senate Building.",
      category: "Counselling",
      language: "english",
    },
    // Hausa
    {
      question: "Yaya ake yin rajistar kwas?",
      answer: "Shiga cikin shafin dalibai (portal), sannan ka je bangaren rajista, ka zabi kwasashenda za ka yi a wannan zangon karatu, sannan ka danna 'submit' domin amincewar mai ba ka shawara (advisor).",
      category: "Academics",
      language: "hausa",
    },
    {
      question: "Mene ne bukatun sabbin dalibai?",
      answer: "Sabbin dalibai suna bukatar wasikar shiga makaranta ta JAMB, sakamakon O-level, takardar haifuwa, da shaida daga jihar su domin tantancewa.",
      category: "Admission",
      language: "hausa",
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
  }

  // 4. Contacts
  const contacts = [
    {
      officeName: "Admissions Office",
      contactEmail: "admissions@fudma.edu.ng",
      contactPhone: "08012345678",
      officeLocation: "Senate Building, Ground Floor",
    },
    {
      officeName: "Bursary Department",
      contactEmail: "bursary@fudma.edu.ng",
      contactPhone: "08087654321",
      officeLocation: "Administrative Block A",
    },
    {
      officeName: "ICT Center",
      contactEmail: "ict@fudma.edu.ng",
      contactPhone: "08000011122",
      officeLocation: "Library Annex",
    },
  ];

  for (const contact of contacts) {
    await prisma.contact.create({ data: contact });
  }

  // 5. Academic Info
  const academicInfos = [
    {
      title: "Grading System",
      content: "FUDMA uses a 5.0 CGPA scale. A: 5.0 (70-100), B: 4.0 (60-69), C: 3.0 (50-59), D: 2.0 (45-49), E: 1.0 (40-44), F: 0.0 (0-39).",
      category: "Examination",
      language: "english",
    },
    {
      title: "Tsarin Maki (Grading)",
      content: "FUDMA tana amfani da ma'aunin CGPA 5.0. 'A' ita ce 5.0 (daga maki 70-100), yayin da 'F' ita ce 0.0 (daga maki 0-39).",
      category: "Examination",
      language: "hausa",
    },
  ];

  for (const info of academicInfos) {
    await prisma.academicInfo.create({ data: info });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
