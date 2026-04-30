import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

async function checkCars() {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  const app = initializeApp(config);
  const db = getFirestore(app);
  
  const snapshot = await getDocs(collection(db, 'cars'));
  console.log(`Total cars in Firestore: ${snapshot.size}`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`- ${data.make} ${data.model} (${data.status})`);
  });
}

checkCars().catch(console.error);
