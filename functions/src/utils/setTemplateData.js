const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

async function setTemplateData(id = "template") {

  // user document
  const userRef = db.collection("users");
  const userData = userRef.doc(`${id}user`);

  await userData.set({
    name: "John Doe",
    email: "themiddnight.dev@gmail.com",
    password: "password",
    resume_ids: [`${id}resume`],
    api_keys: [
      {
        key: "123456",
        name: "for read",
        permissions: "read"
      },
      {
        key: "abcdef",
        name: "for read and write",
        permissions: "read, write"
      }
    ]
  });

  // resume document
  const resumeRef = db.collection("resumes");
  const resumeDoc = resumeRef.doc(`${id}resume`);

  await resumeDoc.set({
    user_id: `${id}user`,
    resume_name: "Template Resume",
    active: true,
  });

  // resume data
  const resumeData = resumeRef.doc(`${id}resume`).collection("data");

  await resumeData.doc("settings").set({
    layout: 0,
    background_mode: 1,
    intro: {
      title: "Hi!",
      subtitle: "Welcome to my resume",
      enter_button: "Enter",
    },
  });

  await resumeData.doc("profile").set({
    subtitle: "",
    image_path: "",
    image_url: "",
    contact: {
      location: "",
      email: "",
      phone: "",
    },
    links: [],
  });

  await resumeData.doc("about").set({
    active: true,
    title: "About",
    data: [
      { content: "" }
    ],
  });

  await resumeData.doc("education").set({
    active: true,
    title: "Education",
    subtitle: "",
    display_limit: 3,
    data: [],
  });

  await resumeData.doc("experiences").set({
    active: true,
    title: "Experiences",
    subtitle: "",
    display_limit: 3,
    data: [],
  });

  await resumeData.doc("projects").set({
    active: true,
    title: "Projects",
    subtitle: "",
    display_limit: 10,
    data: [],
  });

  await resumeData.doc("skills").set({
    active: true,
    title: "Skills",
    subtitle: "",
    display_limit: 10,
    data: [],
  });

  await resumeData.doc("tools").set({
    active: true,
    title: "Tools",
    subtitle: "",
    display_limit: 10,
    display_mode: 1,
    data: [],
  });

  await resumeData.doc("languages").set({
    active: true,
    title: "Languages",
    subtitle: "",
    display_limit: 3,
    data: [],
  });

  await resumeData.doc("certifications").set({
    active: true,
    title: "Certifications",
    subtitle: "",
    display_limit: 3,
    data: [],
  });

  await resumeData.doc("other_links").set({
    active: true,
    title: "Other Profiles",
    subtitle: "",
    display_limit: 3,
    data: [],
  });

  await resumeData.doc("public_notes").set({
    active: false,
    display_limit: 3,
    title: "Public Notes",
    subtitle: "",
  });

  console.log(`Create "${id}" data set in Firestore`);
}

////////////////////////////////////////////////////////////////////////////////

async function setExampleData(id = "example") {
  // user data
  const userRef = db.collection("users");
  const userData = userRef.doc(`${id}user`);

  await userData.set({
    name: "Pathompong Thitithan",
    email: "the.midnight.k.0173@gmail.com",
    password: "password",
    resume_ids: [`${id}resume`],
    api_keys: [
      {
        key: "123456",
        name: "for read",
        permissions: "read"
      },
      {
        key: "abcdef",
        name: "for read and write",
        permissions: "read, write"
      }
    ]
  });

  // resume data
  const data = require("./data.json");

  const resumeRef = db.collection("resumes");
  const resumeDoc = resumeRef.doc(`${id}resume`);
  const resumeData = resumeRef.doc(`${id}resume`).collection("data");

  await resumeDoc.set({
    user_id: `${id}user`,
    resume_name: "Developer Resume",
    active: true,
  });

  for (const key in data) {
    await resumeData.doc(key).set(data[key]);
  }

  console.log(`Example data imported to "${id}" in Firestore`);
}

module.exports = { setExampleData, setTemplateData };
