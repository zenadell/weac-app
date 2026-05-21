// 1:1 port of src/lib/subjects.ts
import dna from "../../assets/lovable/dna-helix.png";
import atom from "../../assets/lovable/atom.png";
import calculator from "../../assets/lovable/calculator.png";
import books from "../../assets/lovable/books.png";
import brain from "../../assets/lovable/brain.png";

export const subjects = {
  biology: {
    id: "biology", name: "Biology", subtitle: "Genetics & Ecology",
    gradient: "mint", image: dna, mastery: 72,
    topics: [
      { name: "Cell Division", progress: 88, minutes: 12 },
      { name: "Photosynthesis", progress: 74, minutes: 18 },
      { name: "Genetics", progress: 62, minutes: 24 },
      { name: "Ecology", progress: 58, minutes: 22 },
      { name: "Evolution", progress: 40, minutes: 30 },
    ],
  },
  maths: {
    id: "maths", name: "Maths", subtitle: "Calculus & Algebra",
    gradient: "lilac", image: calculator, mastery: 45,
    topics: [
      { name: "Algebra", progress: 70, minutes: 15 },
      { name: "Calculus", progress: 42, minutes: 30 },
      { name: "Trigonometry", progress: 38, minutes: 25 },
      { name: "Statistics", progress: 30, minutes: 20 },
    ],
  },
  physics: {
    id: "physics", name: "Physics", subtitle: "Mechanics & Waves",
    gradient: "butter", textDark: true, image: atom, mastery: 38,
    topics: [
      { name: "Mechanics", progress: 55, minutes: 20 },
      { name: "Wave Motion", progress: 42, minutes: 22 },
      { name: "Electricity", progress: 30, minutes: 28 },
      { name: "Thermodynamics", progress: 25, minutes: 24 },
    ],
  },
  english: {
    id: "english", name: "English", subtitle: "Comprehension & Essay",
    gradient: "rose", image: books, mastery: 68,
    topics: [
      { name: "Comprehension", progress: 80, minutes: 12 },
      { name: "Essay Writing", progress: 70, minutes: 25 },
      { name: "Lexis & Structure", progress: 60, minutes: 18 },
      { name: "Oral English", progress: 55, minutes: 15 },
    ],
  },
  chemistry: {
    id: "chemistry", name: "Chemistry", subtitle: "Organic & Inorganic",
    gradient: "sky", image: brain, mastery: 55,
    topics: [
      { name: "Organic Bonding", progress: 72, minutes: 22 },
      { name: "Stoichiometry", progress: 55, minutes: 20 },
      { name: "Electrochemistry", progress: 48, minutes: 24 },
      { name: "Periodic Table", progress: 40, minutes: 16 },
    ],
  },
};

export const subjectList = Object.values(subjects);
