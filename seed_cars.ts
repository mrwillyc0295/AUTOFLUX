import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

async function createCars() {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  const app = initializeApp(config);
  const db = getFirestore(app);
  
  const cars = [
    { make: "Toyota", model: "Land Cruiser 300", year: 2024, price: 95000, mileage: 0, image: "https://picsum.photos/seed/toyota-lc/1200/800" },
    { make: "Ford", model: "F-150 Raptor", year: 2023, price: 89000, mileage: 5000, image: "https://picsum.photos/seed/ford-raptor/1200/800" },
    { make: "Chevrolet", model: "Tahoe RST", year: 2024, price: 82000, mileage: 1200, image: "https://picsum.photos/seed/chevy-tahoe/1200/800" },
    { make: "Jeep", model: "Wrangler Rubicon 392", year: 2024, price: 92000, mileage: 0, image: "https://picsum.photos/seed/jeep-rubicon/1200/800" },
    { make: "Tesla", model: "Model X Plaid", year: 2024, price: 94000, mileage: 0, image: "https://picsum.photos/seed/tesla-modelx/1200/800" }
  ];

  const sellerInfo = {
    seller: "AutoFlux Premium",
    sellerId: "autoflux_official",
    sellerWhatsApp: "+584120000000",
    sellerPhoto: "https://picsum.photos/seed/autoflux-admin/200/200",
    sellerBio: "Canal oficial de AutoFlux para vehículos exclusivos en consignación digital.",
    location: "Isla de Margarita, Venezuela",
    status: "active" as const,
    views: 0,
    clics: 0,
    interactions: 0,
    transmission: "Automática",
    fuelType: "Gasolina",
    engineLiters: "3.5"
  };

  const carsCollection = collection(db, 'cars');

  for (const car of cars) {
    await addDoc(carsCollection, {
      ...car,
      ...sellerInfo,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`Created post for ${car.make} ${car.model}`);
  }
}

createCars().catch(console.error);
