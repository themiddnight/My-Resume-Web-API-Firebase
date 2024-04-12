const { getFirestore } = require("firebase-admin/firestore");
const data = require("./data.json");
const templateData = require("./template_data.json");

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

  for (const key in templateData) {
    await resumeData.doc(key).set(templateData[key]);
  }

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
    verified: true,
    resume_ids: [`${id}resume`, `${id}resume2`],
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

  // user doc datas
  // const userDocResumes = userRef.doc(`${id}user`).collection("resumes");
  // await userDocResumes.add({ resume_id: `${id}resume` });
  // await userDocResumes.add({ resume_id: `${id}resume2` });
    

  // resume data A
  const resumeRefA = db.collection("resumes");
  const resumeDocA = resumeRefA.doc(`${id}resume`);
  const resumeDataA = resumeRefA.doc(`${id}resume`).collection("data");

  await resumeDocA.set({
    user_id: `${id}user`,
    resume_name: "Developer Resume",
    active: true,
  });

  for (const key in data) {
    await resumeDataA.doc(key).set(data[key]);
  }

  // resume data B
  const resumeRefB = db.collection("resumes");
  const resumeDocB = resumeRefB.doc(`${id}resume2`);
  const resumeDataB = resumeRefB.doc(`${id}resume2`).collection("data");

  await resumeDocB.set({
    user_id: `${id}user`,
    resume_name: "Designer Resume",
    active: false,
  });

  for (const key in templateData) {
    await resumeDataB.doc(key).set(templateData[key]);
  }

  console.log(`Example data imported to "${id}" in Firestore`);
}

module.exports = { setExampleData, setTemplateData };
