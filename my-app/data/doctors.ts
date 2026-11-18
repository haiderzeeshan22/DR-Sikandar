export type Doctor = {
  slug: string;
  name: string;
  role: string;
  qualifications: string;
  image: string;
  bio: string;
  specialties: string[];
  education: string[];
  certifications: string[];
  languages: string[];
  socialLinks: {
    instagram: string;
    facebook: string;
    linkedin: string;
    website: string;
  };
};

export const doctors: Doctor[] = [
  {
    slug: "dr-sikandar",
    name: "Dr. Sikandar Abbas",
    role: "Founder & Lead Dentist",
    qualifications:
      "BDS, RDS (Pakistan), C. Implantology (South Korea), FSP (Germany), C. Endo, Ex-Lecturer at KMU",
    image: "/images/doctors/sikandar.PNG",
    bio: "",
    specialties: [],
    education: [],
    certifications: [],
    languages: [],
    socialLinks: {
      instagram: "",
      facebook: "",
      linkedin: "",
      website: "",
    },
  },
  {
    slug: "dr-ali-mehdi",
    name: "Dr. Ali Mehdi",
    role: "Bs Dental",
    qualifications:
      "BS,D (KMU), BS (Hons) Dentistry (KMU), Dental Technologist, Oral Hygienist",
    image: "/images/doctors/dr%20Mehdi.jpg",
    bio: "",
    specialties: [],
    education: [],
    certifications: [],
    languages: [],
    socialLinks: {
      instagram: "",
      facebook: "",
      linkedin: "",
      website: "",
    },
  },
  {
    slug: "dr-hadia-baqir",
    name: "Dr. Hadia Baqir",
    role: "Bs Dental",
    qualifications:
      "BS,D (KMU), BS (Hons) Dentistry (KMU), Dental Technologist, Oral Hygienist",
    image: "/images/doctors/drhadia.jpg",
    bio: "",
    specialties: [],
    education: [],
    certifications: [],
    languages: [],
    socialLinks: {
      instagram: "",
      facebook: "",
      linkedin: "",
      website: "",
    },
  },
  {
    slug: "dr-najma",
    name: "Dr. Najma",
    role: "Bs Dental",
    qualifications:
      "BS,D (KMU), BS (Hons) Dentistry (KMU), Dental Technologist, Oral Hygienist",
    image: "/images/doctors/Dr%20Najmaa.jpg",
    bio: "",
    specialties: [],
    education: [],
    certifications: [],
    languages: [],
    socialLinks: {
      instagram: "",
      facebook: "",
      linkedin: "",
      website: "",
    },
  },
  

];
