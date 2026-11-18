export type ClinicContact = {
  phone: string;
  email: string;
  address: string;
  mapUrl: string;
};

export type ClinicHours = {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
};

export type ClinicInfo = {
  name: string;
  shortName: string;
  tagline: string;
  founder: {
    name: string;
    qualification: string;
    role: string;
    image: string;
  };
  team: string[];
  contact: ClinicContact;
  hours: ClinicHours;
  socialLinks: {
    instagram: string;
    facebook: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
  };
};

export const clinicInfo: ClinicInfo = {
  name: "Family Dental Clinic",
  shortName: "Family Dental Clinic",
  tagline: "",
  founder: {
    name: "Dr. Sikandar Abbas",
    qualification:
      "BDS, RDS (Pakistan), C. Implantology (South Korea), FSP (Germany), C. Endo, Ex-Lecturer at KMU",
    role: "Founder & Lead Dentist",
    image: "/images/doctors/sikandar.PNG",
  },
  team: [
    "Dr. Hadia Baqir",
    "Dr. Ali Mehdi",
    "Dr. Najma",
  ],
  contact: {
    phone: "0304 9420496",
    email: "",
    address: "",
    mapUrl: "",
  },
  hours: {
    monday: "8:00 AM - 8:00 PM",
    tuesday: "8:00 AM - 8:00 PM",
    wednesday: "8:00 AM - 8:00 PM",
    thursday: "8:00 AM - 8:00 PM",
    friday: "8:00 AM - 8:00 PM",
    saturday: "8:00 AM - 8:00 PM",
    sunday: "8:00 AM - 8:00 PM",
  },
  socialLinks: {
    instagram: "",
    facebook: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
  },
};
