const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, getDoc } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

const firebaseConfig = {
  apiKey: "AIzaSyBObuvyLsyMh5Ly-Uf0svX0EwFCDRH9qoU",
  authDomain: "abri-servi.firebaseapp.com",
  projectId: "abri-servi",
  storageBucket: "abri-servi.firebasestorage.app",
  messagingSenderId: "570318467650",
  appId: "1:570318467650:web:82b6d8d698bf4734a4b3db",
  measurementId: "G-K59WDC0ZMY"
};

async function seed() {
  console.log("🔥 Conectando a Firebase Firestore para el proyecto:", firebaseConfig.projectId);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const raw = fs.readFileSync(path.join(__dirname, "../data/store.json"), "utf8");
  const storeData = JSON.parse(raw);

  const payload = {
    ...storeData,
    updated_at: new Date().toISOString()
  };

  console.log(`📦 Guardando la carta completa (${storeData.dishes?.length} platos, ${storeData.categories?.length} categorías)...`);
  const docRef = doc(db, "stores", "abriyservi");
  await setDoc(docRef, payload, { merge: true });

  console.log("🔍 Verificando lectura desde Firestore...");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    console.log("✅ ¡ÉXITO! La carta ya está guardada y activa en Firestore.");
    console.log(`Categorías creadas: ${data.categories?.length} | Platos creados: ${data.dishes?.length}`);
    process.exit(0);
  } else {
    console.error("❌ No se encontró el documento luego de escribir.");
    process.exit(1);
  }
}

seed().catch(err => {
  if (err.message && (err.message.includes("Cloud Firestore API has not been used") || err.message.includes("is disabled"))) {
    console.error("\n⚠️ AVISO: Cloud Firestore aún no está activado en la consola de Firebase.");
    console.error("1. Abrí este enlace: https://console.firebase.google.com/project/abri-servi/firestore");
    console.error("2. Hacé clic en 'Crear base de datos' (en Modo de prueba / Test mode).");
    console.error("3. Volvé a ejecutar: npm run db:seed\n");
  } else if (err.code === "permission-denied") {
    console.error("\n⚠️ REGLAS DE SEGURIDAD: Firestore denegó el permiso de escritura.");
    console.error("En la consola > Firestore Database > pestaña 'Reglas' (Rules) permití lectura/escritura:\n");
    console.error("rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}\n");
  } else {
    console.error("Error al conectar con Firebase:", err);
  }
  process.exit(1);
});
