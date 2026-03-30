export const doctorProfileImage = "/profilePicture.png";

export const testimonials = [
  {
    src: "/testimonials/WhatsApp Image 2026-03-29 at 11.02.47 PM.jpeg",
    title: "Patient feedback",
    caption:
      "Patient review highlights focused consultation, breathing relief, and a smooth care journey.",
    fit: "contain",
  },
  {
    src: "/testimonials/WhatsApp Image 2026-03-29 at 11.02.47 PM (1).jpeg",
    title: "Family trust",
    caption:
      "Shared appreciation from families who felt supported through surgery and recovery.",
    fit: "contain",
  },
  {
    src: "/testimonials/WhatsApp Image 2026-03-29 at 11.02.47 PM (2).jpeg",
    title: "Real-world reassurance",
    caption:
      "Review captures that reinforce patient confidence in clear communication and ENT expertise.",
    fit: "contain",
  },
];

export const conferences = [
  {
    src: "/conferences/WhatsApp Image 2026-03-29 at 10.51.05 PM.jpeg",
    title: "Conference presence",
    caption: "Participation in recognised clinical forums and academic ENT meetings.",
    fit: "cover",
  },
  {
    src: "/conferences/WhatsApp Image 2026-03-29 at 10.51.05 PM (1).jpeg",
    title: "Professional exchange",
    caption: "A visible role in specialty gatherings shaped by peer learning and discussion.",
    fit: "cover",
  },
  {
    src: "/conferences/WhatsApp Image 2026-03-29 at 10.51.07 PM.jpeg",
    title: "Speaker session",
    caption: "Conference moments that reflect educational contribution and specialist visibility.",
    fit: "cover",
  },
  {
    src: "/conferences/WhatsApp Image 2026-03-29 at 10.51.07 PM (1).jpeg",
    title: "Academic engagement",
    caption: "Images from respected forums where expertise is shared with the wider medical community.",
    fit: "cover",
  },
  {
    src: "/conferences/WhatsApp Image 2026-03-29 at 10.51.08 PM.jpeg",
    title: "Peer connection",
    caption: "Conference participation reinforcing ongoing learning and collaborative clinical practice.",
    fit: "cover",
  },
  {
    src: "/conferences/WhatsApp Image 2026-03-29 at 10.51.08 PM (1).jpeg",
    title: "Recognised stage presence",
    caption: "Academic and professional visibility across recognised conferences and ENT events.",
    fit: "cover",
  },
  {
    src: "/conferences/WhatsApp Image 2026-03-29 at 10.51.08 PM (2).jpeg",
    title: "Specialty forum highlight",
    caption: "Conference imagery that supports the doctor’s role in specialist conversations.",
    fit: "cover",
  },
];

export const awards = [
  {
    src: "/awards/WhatsApp Image 2026-03-29 at 10.54.04 PM.jpeg",
    title: "Recognition moment",
    caption: "Professional recognition that reflects patient trust and peer respect.",
    fit: "cover",
  },
  {
    src: "/awards/WhatsApp Image 2026-03-29 at 10.54.05 PM.jpeg",
    title: "Clinical accolade",
    caption: "Accolades that reinforce the doctor’s reputation for focused ENT care.",
    fit: "cover",
  },
  {
    src: "/awards/WhatsApp Image 2026-03-29 at 10.54.05 PM (1).jpeg",
    title: "Specialist recognition",
    caption: "Award imagery that reflects long-term clinical credibility and contribution.",
    fit: "cover",
  },
  {
    src: "/awards/WhatsApp Image 2026-03-29 at 10.54.06 PM.jpeg",
    title: "Award presentation",
    caption: "A visible sign of the trust and skill associated with the doctor’s work.",
    fit: "cover",
  },
];

export const recognitionHighlights = [
  {
    label: "Testimonials",
    value: `${testimonials.length} review captures`,
  },
  {
    label: "Conferences",
    value: `${conferences.length} recognised highlights`,
  },
  {
    label: "Awards",
    value: `${awards.length} recognition moments`,
  },
];

export const recognitionPreview = [
  {
    ...testimonials[0],
    eyebrow: "Patient voice",
  },
  {
    ...conferences[5],
    eyebrow: "Conference visibility",
  },
  {
    ...awards[3],
    eyebrow: "Professional recognition",
  },
];
