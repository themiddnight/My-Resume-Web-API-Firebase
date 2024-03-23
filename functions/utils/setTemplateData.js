const { getFirestore } = require("firebase-admin/firestore");
const data = require("./data.json");

const db = getFirestore();

async function setTemplateData() {
  const resumeRef = db.collection("resumes");
  const resumeData = resumeRef.doc("template").collection("data");

  await resumeData.doc("intro").set({
    title: "Hi!",
    subtitle: "Welcome to my resume",
    loading_message: "Loading...",
    enter_button: "Enter",
  });

  await resumeData.doc("profile").set({
    title: "",
    subtitle: "",
    image_url: "",
    contact: {
      location: "",
      email: "",
      phone: "",
    },
    links: [],
  });

  await resumeData.doc("about").set({
    active: false,
    title: "About",
    data: [],
  });

  await resumeData.doc("education").set({
    active: false,
    title: "Education",
    display_limit: 3,
    data: [],
  });

  await resumeData.doc("experiences").set({
    active: false,
    title: "Experiences",
    display_limit: 3,
    data: [],
  });

  await resumeData.doc("personal_projects").set({
    active: false,
    title: "Personal Projects",
    display_limit: 10,
    data: [],
  });

  await resumeData.doc("skills").set({
    active: false,
    title: "Skills",
    display_limit: 10,
    data: [],
  });

  await resumeData.doc("tools").set({
    active: false,
    title: "Tools",
    display_limit: 10,
    data: [],
  });

  await resumeData.doc("languages").set({
    active: false,
    title: "Languages",
    display_limit: 3,
    data: [],
  });

  await resumeData.doc("certifications").set({
    active: false,
    title: "Certifications",
    display_limit: 3,
    data: [],
  });

  await resumeData.doc("other_profiles").set({
    active: false,
    title: "Other Profiles",
    display_limit: 3,
    data: [],
  });

  await resumeData.doc("public_notes").set({
    active: false,
    display_limit: 4,
    title: "Public Notes",
  });

  console.log("Default data set in Firestore");
}

////////////////////////////////////////////////////////////////////////////////

async function setExampleData() {
  const resumeRef = db.collection("resumes");
  const resumeData = resumeRef.doc("example").collection("data");

  for (const key in data) {
    await resumeData.doc(key).set(data[key]);
  }

  console.log("Example data imported to Firestore");
}

module.exports = { setExampleData, setTemplateData };
