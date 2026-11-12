export type Service = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  image: string;
  careIncludes: string[];
};

export const services: Service[] = [
  {
    slug: "periodontics",
    name: "Periodontics",
    shortDescription: "Care for healthy gums and the supporting structures around your teeth.",
    description:
      "Periodontal care focuses on the gums and supporting tissues that help keep your teeth healthy. Assessment and personalized treatment can help address gum inflammation and support lasting oral health.",
    image: "/images/services/Periodontics.jpg",
    careIncludes: [
      "Gum health assessment and personalized oral hygiene guidance",
      "Professional cleaning to remove plaque and tartar",
      "Treatment planning for gum inflammation and periodontal disease",
    ],
  },
  {
    slug: "pediatric-dentistry",
    name: "Pediatric Dentistry",
    shortDescription: "Gentle, age-appropriate dental care for children and growing smiles.",
    description:
      "Pediatric dentistry helps children build healthy habits and feel comfortable during dental visits. Care is tailored to a child's age, development, and individual needs, with clear guidance for families.",
    image: "/images/services/Pediatric%20Dentistry.jpg",
    careIncludes: [
      "Routine dental checkups and preventive care",
      "Guidance on brushing, flossing, and healthy habits",
      "Support for common dental needs as a child's smile develops",
    ],
  },
  {
    slug: "implant-dentistry",
    name: "Implant Dentistry",
    shortDescription: "Assessment and treatment planning for replacing missing teeth with dental implants.",
    description:
      "Implant dentistry explores options for replacing missing teeth with restorations supported by dental implants. A consultation helps assess oral health, discuss suitability, and plan care around each patient's needs.",
    image: "/images/services/Implant%20Dentistry.jpg",
    careIncludes: [
      "Consultation and assessment of the area",
      "Personalized implant treatment planning",
      "Discussion of restoration options and ongoing care",
    ],
  },
  {
    slug: "endodontics",
    name: "Endodontics",
    shortDescription: "Treatment focused on the inner tissues of the tooth, including root canal care.",
    description:
      "Endodontic treatment addresses problems inside a tooth, including infection or inflammation of the dental pulp. When appropriate, root canal treatment can help preserve the natural tooth.",
    image: "/images/services/Endodontics.jpg",
    careIncludes: [
      "Assessment of tooth pain or sensitivity",
      "Root canal treatment when clinically appropriate",
      "Advice on restoring and caring for the treated tooth",
    ],
  },
  {
    slug: "prosthodontics",
    name: "Prosthodontics",
    shortDescription: "Restorative solutions to replace or repair teeth and support everyday function.",
    description:
      "Prosthodontics focuses on restoring or replacing teeth to support comfort, function, and appearance. Treatment options are selected after assessing each patient's oral health and goals.",
    image: "/images/services/Prosthodontics.jpg",
    careIncludes: [
      "Assessment of damaged or missing teeth",
      "Planning for crowns, bridges, dentures, or other restorations",
      "Guidance on maintaining dental restorations",
    ],
  },
  {
    slug: "conscious-sedation",
    name: "Conscious Sedation",
    shortDescription: "An option to help eligible patients feel more relaxed during dental treatment.",
    description:
      "Conscious sedation may help reduce anxiety for some patients during dental treatment. The dentist will discuss medical history, suitability, preparation, and aftercare before recommending an approach.",
    image: "/images/services/Conscious%20Sedation.jpg",
    careIncludes: [
      "Discussion of anxiety, medical history, and treatment needs",
      "Assessment of whether sedation is appropriate",
      "Clear preparation and aftercare instructions when arranged",
    ],
  },
];
