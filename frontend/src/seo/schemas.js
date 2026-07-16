import { SITE_URL } from "./config";

export function buildClinicSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: "Dr. Deepti Sinha ENT Clinic",
    alternateName: ["drdeeptient", "drdeeptientdelhi", "delhidrdeeptient"],
    keywords: "drdeeptient, drdeeptientdelhi, delhidrdeeptient, Dr Deepti Sinha ENT Delhi, ENT specialist Delhi",
    url: SITE_URL,
    image: `${SITE_URL}/profilePicture.png`,
    telephone: "+91-8796808081",
    email: "drdeeptientclinic@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "CK Birla Hospital, Punjabi Bagh",
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      addressCountry: "IN",
    },
    medicalSpecialty: ["Otolaryngologic"],
    physician: {
      "@type": "Physician",
      name: "Dr. Deepti Sinha",
      medicalSpecialty: "Otolaryngology",
    },
  };
}

export function buildDoctorSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: "Dr. Deepti Sinha",
    alternateName: ["drdeeptient", "drdeeptientdelhi", "delhidrdeeptient"],
    keywords: "drdeeptient, drdeeptientdelhi, delhidrdeeptient, Dr Deepti Sinha ENT Delhi",
    medicalSpecialty: "Otolaryngology",
    url: `${SITE_URL}/doctors/1`,
    image: `${SITE_URL}/profilePicture.png`,
    worksFor: {
      "@type": "Hospital",
      name: "CK Birla Hospital",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "New Delhi",
      addressRegion: "Delhi",
      addressCountry: "IN",
    },
  };
}
