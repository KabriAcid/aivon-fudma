import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Clear existing data
  await prisma.conversation.deleteMany();
  await prisma.session.deleteMany();
  await prisma.academicInfo.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.department.deleteMany();

  // Seed Departments
  const departments = await prisma.department.createMany({
    data: [
      {
        name: "Faculty of Science",
        faculty: "Science",
        hodName: "Prof. Alhaji Mohammed Sabo",
        hodContact: "+234 803 456 7890",
        officeLocation: "Science Building, 1st Floor",
      },
      {
        name: "Faculty of Education",
        faculty: "Education",
        hodName: "Dr. Khadija Musa Ibrahim",
        hodContact: "+234 805 123 4567",
        officeLocation: "Education Block, Room 201",
      },
      {
        name: "Faculty of Social Sciences",
        faculty: "Social Sciences",
        hodName: "Prof. Abubakar Yusuf Hassan",
        hodContact: "+234 807 890 1234",
        officeLocation: "Social Sciences Building, 2nd Floor",
      },
      {
        name: "Faculty of Engineering",
        faculty: "Engineering",
        hodName: "Engr. Zainab Abubakar Ado",
        hodContact: "+234 809 234 5678",
        officeLocation: "Engineering Complex, Main Office",
      },
    ],
  });
  console.log(`✅ Created ${departments.count} departments`);

  // Seed FAQs - English
  const faqsEnglish = await prisma.fAQ.createMany({
    data: [
      {
        question: "What are the admission requirements for undergraduate programs?",
        answer:
          "Admission requirements include: UTME score of minimum 180, A-Level or equivalent qualification, WAEC/NECO O-Level passes in English and Mathematics. Candidates must complete the JAMB form, sit for UTME, and participate in the post-UTME screening test.",
        category: "Admission",
        language: "english",
      },
      {
        question: "How do I register for courses each semester?",
        answer:
          "Course registration is conducted online through the student portal. Log in with your matric number, select courses for your level following the recommended curriculum, and submit for departmental approval. Registration typically occurs in the first two weeks of each semester.",
        category: "Academics",
        language: "english",
      },
      {
        question: "What is the minimum CGPA required to graduate?",
        answer:
          "Students must maintain a minimum CGPA of 1.50 (on a 5.00 scale) to graduate. Students with CGPA below 1.50 may be placed on academic probation and may be required to repeat courses.",
        category: "Academics",
        language: "english",
      },
      {
        question: "How do I access academic counselling services?",
        answer:
          "Academic counselling is available through the Student Affairs Office, located in the Main Administration Building, Room 104. Counsellors are available Monday to Friday, 9:00 AM to 4:00 PM. You can also email counselling@fudma.edu.ng for online support.",
        category: "Counselling",
        language: "english",
      },
      {
        question: "What are the tuition fees for local and international students?",
        answer:
          "Tuition fees vary by program. Local students pay between ₦50,000 to ₦150,000 per semester depending on the faculty. International students pay in US dollars, typically $2,000 to $4,000 per semester. Contact the Bursary Office for exact amounts.",
        category: "Admission",
        language: "english",
      },
    ],
  });
  console.log(`✅ Created ${faqsEnglish.count} English FAQs`);

  // Seed FAQs - Hausa
  const faqsHausa = await prisma.fAQ.createMany({
    data: [
      {
        question: "Menene abubuwan da aka bukaci don shiga jami'a?",
        answer:
          "Za ka bukaci: Scores na UTME na aƙalla 180, A-Level ko daidai da shi, wajen karatu na WAEC/NECO. Dole ne ka cika fomu na JAMB, halarci UTME, da kuma gwaje na gida.",
        category: "Admission",
        language: "hausa",
      },
      {
        question: "Yaya zan yi ajiyar jarra na karatua a waje?",
        answer:
          "Ajiyar jarra ana yi ta hanyar intanet wurin da aka karada. Segin da alamar matric naka, zaɓi jarra na mataki naka bayan kira, sai ka gabatar. Ajiyar jarra tana faruwa a farkon jiya biyar na karatua.",
        category: "Academics",
        language: "hausa",
      },
      {
        question: "Menene matakin karatu da ya zama dole don gama karatua?",
        answer:
          "Dole ne ka sami matakin karatu na aƙalla 1.50 (jiya 5.00) domin ka gama aiki. Idan ka sami kasa da haka, ana iya sanya ka a tsarin karatu mai tsanani.",
        category: "Academics",
        language: "hausa",
      },
    ],
  });
  console.log(`✅ Created ${faqsHausa.count} Hausa FAQs`);

  // Seed Contacts
  const contacts = await prisma.contact.createMany({
    data: [
      {
        officeName: "Admissions Office",
        contactEmail: "admissions@fudma.edu.ng",
        contactPhone: "+234 806 123 4567",
        officeLocation: "Main Administration Building, Ground Floor",
      },
      {
        officeName: "Student Affairs Office",
        contactEmail: "studentaffairs@fudma.edu.ng",
        contactPhone: "+234 808 234 5678",
        officeLocation: "Main Administration Building, 1st Floor, Room 104",
      },
      {
        officeName: "Bursary Office",
        contactEmail: "bursary@fudma.edu.ng",
        contactPhone: "+234 810 345 6789",
        officeLocation: "Finance Building, 2nd Floor",
      },
      {
        officeName: "Registrar's Office",
        contactEmail: "registrar@fudma.edu.ng",
        contactPhone: "+234 812 456 7890",
        officeLocation: "Main Administration Building, 3rd Floor",
      },
      {
        officeName: "Library Services",
        contactEmail: "library@fudma.edu.ng",
        contactPhone: "+234 814 567 8901",
        officeLocation: "Central Library, Main Campus",
      },
    ],
  });
  console.log(`✅ Created ${contacts.count} contacts`);

  // Seed Academic Information - English
  const academicInfoEnglish = await prisma.academicInfo.createMany({
    data: [
      {
        title: "Course Registration Procedure",
        content:
          "All students must register for courses at the beginning of each semester. Registration is done online through the student portal. Select courses according to your level, get departmental approval, and submit before the deadline. Failure to register may result in suspension of academic activities.",
        category: "Registration",
        language: "english",
      },
      {
        title: "Examination Guidelines",
        content:
          "Examinations are conducted at the end of each semester. Students must have at least 75% attendance to be eligible to sit for examinations. Examination malpractice results in automatic failure and possible expulsion. All exam schedules are posted on the university notice board.",
        category: "Examination",
        language: "english",
      },
      {
        title: "Graduation Requirements",
        content:
          "To graduate, students must: complete all required courses, maintain a minimum CGPA of 1.50, clear all academic and financial obligations, and pass the comprehensive examination. Graduation ceremonies are held twice yearly in January and September.",
        category: "Coursework",
        language: "english",
      },
      {
        title: "Academic Probation Policy",
        content:
          "Students with a CGPA below 1.50 at the end of any semester are placed on academic probation. During probation, students must retake failed courses and maintain minimum performance. Failure to improve may result in dismissal from the university.",
        category: "Coursework",
        language: "english",
      },
    ],
  });
  console.log(`✅ Created ${academicInfoEnglish.count} English academic info entries`);

  // Seed Academic Information - Hausa
  const academicInfoHausa = await prisma.academicInfo.createMany({
    data: [
      {
        title: "Tsari na Ajiyar Jarra",
        content:
          "Kowa dole ne ya ajiye jarra a farkon waje. Ajiyar jarra ta hanyar intanet ne. Zaɓi jarra na matakinka, sami karɓar sashin naka, jiya ka gabatar. Ba ajiyar jarra na iya haifar da dakatarwa.",
        category: "Registration",
        language: "hausa",
      },
      {
        title: "Ka'idoji na Gwaji",
        content:
          "Gwaji ana yi a ƙarshen waje. Dole ne ka kasance a karatu aƙalla rabin sati. Yin aikin jari a gwaji zai haifar da kasa. Kadarar gwaji ana buga a bodi na jihar.",
        category: "Examination",
        language: "hausa",
      },
    ],
  });
  console.log(`✅ Created ${academicInfoHausa.count} Hausa academic info entries`);

  // Create sample session and conversations
  const session = await prisma.session.create({
    data: {
      sessionId: `session_${Date.now()}`,
      selectedLanguage: "english",
      conversations: {
        create: [
          {
            role: "user",
            message: "What are the admission requirements?",
          },
          {
            role: "assistant",
            message:
              "Admission requirements include: UTME score of minimum 180, A-Level or equivalent qualification, and WAEC/NECO O-Level passes.",
          },
        ],
      },
    },
  });
  console.log(`✅ Created sample session with ${session.id}`);

  console.log("✅ Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
